var Decimate = require('./decimate');
describe("Decimate Tests", function () {

    test("Radial distance works for a line", function () {
        var line = [
            [0,0],
            [.3,.3],
            [.5,.5],
            [1,1],
            [1.2,1],
            [2,1],
            [2,2]
        ];

        var s = new Decimate(null,null);
        var simplified = s.decimateRadialDistance(line,1);
        expect(simplified.length).toEqual(3);
        expect(simplified[0]).toEqual(line[0]);
        expect(simplified[1]).toEqual(line[3]);
        expect(simplified[2]).toEqual(line[6]);

    });

    test("Radial distance works for a ring", function () {
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

        var s = new Decimate(null, null);
        var simplified = s.decimateRadialDistance(line, 1);
        expect(simplified.length).toEqual(6);
        expect(simplified[0]).toEqual(line[0]);
        expect(simplified[1]).toEqual(line[3]);
        expect(simplified[2]).toEqual(line[6]);
        expect(simplified[3]).toEqual(line[7]);
        expect(simplified[4]).toEqual(line[9]);
        expect(simplified[5]).toEqual(line[10]);
    });

    test("Douglas-Peuker works for a simple line", function() {
        var line = [
            [0,0],
            [.3,.3],
            [.5,.5],
            [1,1],
            [1.2,1],
            [2,1],
            [2,2]
        ];

        var s = new Decimate(null,null);
        var simplified = s.decimateRadialDistance(line,1);
        expect(simplified.length).toEqual(3);
        expect(simplified[0]).toEqual(line[0]);
        expect(simplified[1]).toEqual(line[3]);
        expect(simplified[2]).toEqual(line[6]);
    });

    test("Douglas-Peuker works for a ring", function() {
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

        var s = new Decimate(null, null);
        var simplified = s.decimateRadialDistance(line, 1);
        expect(simplified.length).toEqual(6);
        expect(simplified[0]).toEqual(line[0]);
        expect(simplified[1]).toEqual(line[3]);
        expect(simplified[2]).toEqual(line[6]);
        expect(simplified[3]).toEqual(line[7]);
        expect(simplified[4]).toEqual(line[9]);
        expect(simplified[5]).toEqual(line[10]);
    });

});
