# decimate
Simplify (decimate) the geometry of a geojson object

## Usage

    let Decimate = require('decimate');
    var line = [
        [0, 0],
        [.3, .3],
        [.5, .5],
        [1, 1],
        [1.2, 1],
        [2, 1],
        [4, 5],
        [2, 5],
        [1.9, 4.5],
        [1, 3],
        [0, 0]
    ];

    let d = new Decimate(null, null);
    let simplified = d.decimate(line, 1);

### decimate(geojson, distance) 
Returns simplified GeoJSON from the parameter passed to the constructor, taking into account the specified options

geojson (object) must be a valid geojson object with type: "Feature","FeatureCollection","LineString", "MultiLineString", "Polygon", "MultiPolygon", or "GeometryCollection".

returns A simplified version of the original linestring

### decimateRadialDistance(linestring, distance)
Simplify a geojson object using the radial distance algorithm. Distance is a parameter that controls how much the mesh
should be simplified, from 0 to 1.

returns A simplified version of the original linestring

### decimateDouglasPeucker(linestring, distance) 
Apply the Douglas-Peucker algorithm for linestring simplification. This is normally run after a radial distance
simplification first-pass. Distance is a parameter that controls how much the mesh
should be simplified, from 0 to 1.

returns A simplified version of the original linestring

