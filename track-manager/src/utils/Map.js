import coordtransform from 'coordtransform';
export function points2Bpoints(points) {
    const { BMap } = window;
    var Bpoint = [];
    for (var i in points) {
        // 坐标系转换
        var wgs84togcj02 = coordtransform.wgs84togcj02(points[i].Longitude, points[i].Latitude);
        var gcj02tobd09 = coordtransform.gcj02tobd09(wgs84togcj02[0], wgs84togcj02[1]);

        Bpoint.push(new BMap.Point(gcj02tobd09[0], gcj02tobd09[1]));
    }
    return Bpoint;
}