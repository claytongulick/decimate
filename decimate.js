/**
 * decimate.js
 *
 * Class to decimate geojson type by removing extra points and decreasing resolution.
 * Works on the following geojson types:
 * "Feature","FeatureCollection","LineString", "MultiLineString", "Polygon", "MultiPolygon", or "GeometryCollection".
 * 
 */
function Decimate() {

    /**
     * Calculates the distance between two points. Points are expected to be in geojson format, [lon, lat] or [x,y]
     * @param pointA
     * @param pointB
     */
    function pointDistance(pointA, pointB) {
        var x1 = pointA[0], x2 = pointB[0], y1 = pointA[1], y2 = pointB[1];
        var xDelta = x2-x1;
        var yDelta = y2-y1;
        var distance = Math.sqrt((xDelta * xDelta) + (yDelta * yDelta));
        return distance;
    }

    /**
     * Calculates the distance between a line and a point. The line should look like [[x1,y1],[x2,y2]] and the point [x0, y0]
     * d = 2A/b
     * @param line
     * @param point
     */
    function lineDistance(line, point) {
        var x0 = point[0], x1 = line[0][0], x2 = line[1][0],
            y0 = point[1], y1 = line[0][1], y2 = line[1][1];

        //check to see if the line is actually a single point, if so, it's just a simple distance calc
        if((x1 == x2) && (y1 == y2)) return pointDistance(line[0],point);

        //check for vertical line
        if(x1 == x2) {
            //this is vertical, just take the x delta, that's the distance
            return Math.abs(x1 - x0);
        }

        //check to see if the line is horizontal
        if(y1 == y2) {
            //horizontal line, just return the y delta
            return Math.abs(y1 - y0);
        }

        var b = pointDistance(line[0],line[1]);
        var A2 = Math.abs(
            ((y2 - y1) * x0) - ((x2 - x1) * y0) + (x2 * y1) - (y2 * x1)
        );
        return A2 / b;
    }

    /**
     * Apply the radial distance simplification algorithm to a linestring
     * @returns Array A simplified version of the original linestring
     */
    function decimateRadialDistance(linestring, distance) {
        var simplified = [];
        var i=0;
        var run=0;
        var length;

        outer:
        for(i=0; i<linestring.length - 1; i++) {
            simplified.push(linestring[i]);
            for(run=1; (run + i) < linestring.length; run++) {
                length = pointDistance(linestring[i], linestring[i+run]);
                if(length > distance) {
                    i += run - 1;
                    continue outer;
                }
            }
            break; //if we got here, we ran to the end of the linestring, so bail
        }
        //add the end point
        simplified.push(linestring[linestring.length-1]);
        return simplified;
    }

    /**
     * Apply the Douglas-Peucker algorithm for linestring simplification. This is normally run after a radial distance
     * simplification first-pass
     * @returns Array A simplified version of the original linestring
     */
    function decimateDouglasPeucker(linestring, distance) {
        var simplified = [];
        var max_distance = 0;
        var point_distance = 0;
        var max_point_index;
        var left_result;
        var right_result;
        var i;

        for(i=1; i<linestring.length; i++) {
            point_distance = lineDistance([linestring[0], linestring[linestring.length - 1]], linestring[i]);
            if (point_distance > max_distance) {
                max_point_index = i;
                max_distance = point_distance;
            }
        }

        if(max_distance < distance) return [linestring[0], linestring[linestring.length-1]];

        left_result = decimateDouglasPeucker(linestring.slice(0,max_point_index + 1),distance);
        right_result = decimateDouglasPeucker(linestring.slice(max_point_index), distance);
        left_result.pop();
        return left_result.concat(right_result);
    }

    /**
     * Returns simplified GeoJSON from the parameter passed to the constructor, taking into account the specified options
     *
     * @param geojson string a valid geojson object with type: "Feature","FeatureCollection","LineString", "MultiLineString", "Polygon", "MultiPolygon", or "GeometryCollection".
     */
    function decimate(geojson, distance) {

        function decimateFeature() {
            geojson.geometry = decimate(geojson.geometry, distance);
        }

        function decimateFeatureCollection() {
            geojson.features.forEach(
                function(feature) {
                    feature.geometry = decimate(feature.geometry, distance);
                }
            )
        }

        function decimateLineString() {
            geojson.coordinates = decimateRadialDistance(geojson.coordinates, distance); //first pass as radial dist
            geojson.coordinates = decimateDouglasPeucker(geojson.coordinates, distance); //second pass, Douglas-Peucker
        }

        function decimateMultilineString() {
            var i;
            for(i=0; i<geojson.coordinates.length; i++) {
                geojson.coordinates[i] = decimateRadialDistance(geojson.coordinates[i], distance); //first pass as radial dist
                geojson.coordinates[i] = decimateDouglasPeucker(geojson.coordinates[i], distance); //second pass, Douglas-Peucker
            }
        }

        function decimatePolygon() {
            var i;
            for(i=0; i<geojson.coordinates.length; i++) {
                geojson.coordinates[i] = decimateRadialDistance(geojson.coordinates[i], distance); //first pass as radial dist
                geojson.coordinates[i] = decimateDouglasPeucker(geojson.coordinates[i], distance); //second pass, Douglas-Peucker
            }
        }

        function decimateMultiPolygon() {
            var i,j;

            for(i=0; i<geojson.coordinates.length; i++) {
                for(j=0; j<geojson.coordinates[i].length; j++) {
                    geojson.coordinates[i][j] = decimateRadialDistance(geojson.coordinates[i][j], distance); //first pass as radial dist
                    geojson.coordinates[i][j] = decimateDouglasPeucker(geojson.coordinates[i][j], distance); //second pass, Douglas-Peucker
                }
            }
        }

        function decimateGeometryCollection() {
            geojson.geometries.forEach(
                function(geometry) {
                    decimate(geometry);
                }
            )
        }

        var handlers = {
            "feature": decimateFeature,
            "featurecollection": decimateFeatureCollection,
            "linestring": decimateLineString,
            "multilinestring": decimateMultilineString,
            "polygon": decimatePolygon,
            "multipolygon": decimateMultiPolygon,
            "geometrycollection": decimateGeometryCollection,
        }

        if(!handlers[geojson.type.toLowerCase()])
            throw new Error("Unsupported geojson type: " + geojson.type);
        handlers[geojson.type.toLowerCase()]();

    }

    //public API
    this.pointDistance = pointDistance; //for tests
    this.lineDistance = lineDistance; //for tests
    this.decimateRadialDistance = decimateRadialDistance;
    this.decimateDouglasPeuker = decimateDouglasPeucker;
    this.decimate = decimate;

}

//expose for use in nodejs
if ((typeof module != 'undefined') && (typeof module.exports != 'undefined') && (process))
    module.exports = Decimate;
