http://www5.kingcounty.gov/gisdataportal/



curl 'ftp://ftp.kingcounty.gov/gis/Web/GISData/neighborhood_SHP.zip'
unzip neighborhood_SHP.zip
ogr2ogr -f GeoJSON -t_srs EPSG:4326 neighborhood.json neighborhood/neighborhood.shp

curl 'ftp://ftp.kingcounty.gov/gis/Web/GISData/parcel_address_SHP.zip'
unzip parcel_address_SHP.zip
ogr2ogr -f GeoJSON -where "ZIP5 IN ('98119', '98109')" -t_srs EPSG:4326 parcels.json parcel_address/parcel_address.shp


Ref
---
http://bost.ocks.org/mike/map/

