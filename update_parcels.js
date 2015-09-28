
var winston = require('winston');
var fs = require('fs');
var _ = require('lodash');

var geolib = require('geolib');

var mls = {};
var mlsRaw = fs.readFileSync('data/queen_anne_mls.csv').toString().split('\r\n');

for ( var i=1; i < mlsRaw.length; i++ ) {
    var row = mlsRaw[i].split(',');
    mls[row[1].toLowerCase()] = _.zipObject([
        ['SALE_STATUS', row[0]],
        ['SALE_PRICE', parseFloat(row[3])],
        ['YEAR_BUILT', row[4]],
        ['HOUSE_SIZE', parseFloat(row[5])],
        ['LOT_SIZE', 43560*parseFloat(row[6])],
        ['LIST_DATE', row[7]],
        ['SALE_DATE', row[9]],
        ['matched', false]
    ]);
}


var neighborhoods = JSON.parse(fs.readFileSync('data/neighborhood.json','utf8'));
var parcels = JSON.parse(fs.readFileSync('data/parcels.json','utf8'));

var queen_anne = _.find(neighborhoods.features, function(f) {
    return f.properties.NEIGHBORHO == "Queen Anne";
});

queen_anne = _.map(queen_anne.geometry.coordinates[0], function(coord) {
    return {longitude: coord[0], latitude:coord[1]};
})

console.info(parcels.features.length);

var count = 0;
// remove parcels outside of queen anne
parcels.features = _.filter(parcels.features, function(f) {
    var ret = false;
    try {
        count ++;
        ret = geolib.isPointInside({longitude: f.properties.LON, latitude: f.properties.LAT }, queen_anne);
    }
    catch(e) {
        console.error(coord);
    }

    if ( count % 100 == 0 ) console.info(count  );
    return ret;
});

var matches = 0;
_.each(parcels.features, function(f) {
    if ( _.has(mls, f.properties.ADDR_FULL.toLowerCase()) ) {
        matches++;

        f.properties = _.merge(f.properties, mls[f.properties.ADDR_FULL.toLowerCase()]);
        mls[f.properties.ADDR_FULL.toLowerCase()].matched = true;
    }
});

var addys = _.map(_.filter(_.pairs(mls), function(f) { return !f[1].matched; }), function(f) { return f[0];} );

console.info(addys);

var jsonStr = JSON.stringify(parcels);
fs.writeFile('data/parcels2.json', jsonStr, function(err) {
    if (err) {
        winston.error("Couldn't save settings", err);
    }
});
