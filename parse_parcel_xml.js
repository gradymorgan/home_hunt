var fs        = require('fs');
var expat = require('node-expat')

var _ = require('lodash');
var geolib = require('geolib');

var queen_anne_center = {latitude:47.6323268, longitude:-122.3568641};

function filter(position) {
    var x = geolib.getDistance(queen_anne_center, position);
    // console.info(position, x)
    return x < 1390
}

var geojson = [];

count = 0;
error = 0;

var node = {};
var element;

var parser = new expat.Parser('UTF-8')

parser.on('startElement', function (name, attrs) {
    // if (name == 'Placemark') {
    //     node = {};
    // }
    if ( name == 'SimpleData') {
        element = attrs.name.toLowerCase();
    }
    else {
        element = name;    
    }
})

parser.on('endElement', function (name) {
    if (name == 'Placemark') {
        addFeature(node);
        node = {};
    }
    element = null;
})

var whitelist = ['coordinates', 'major', 'minor', 'pin', 'siteid', 'addr_full', 'zip5' ];
parser.on('text', function (text) {
    if (_.contains(whitelist, element )) {
        node[element] = text;

    }
})

function addFeature(node) {
    try {
        coords = _.map(node.coordinates.split(' '), function(i) {
            var arr = i.split(',');
            return [parseFloat(arr[0]), parseFloat(arr[1])];
        });

    
        if ( filter({latitude: coords[0][1], longitude: coords[0][0]}) ) {
            var feature = {
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
              },
              "properties": _.omit(node, 'coordinates')
            };

            geojson.push(feature);
            console.info(feature);
        }
    }
    catch(e) {
        error++;
        // console.error(e, node);
    }

    count++;
    if ( (count + error) % 1000 == 0 ) {
        console.info(count, error);
    }
}

var xmml = fs.createReadStream('data/parcel_address_area/parcel_address_area.kml')
xmml.pipe(parser);

xmml.on('end', function() {
    var jsonStr = JSON.stringify(geojson, null, 4);
    fs.writeFile("queen_anne_2a.json", jsonStr, function(err) {
        if (err) {
            
        }
    });
});
