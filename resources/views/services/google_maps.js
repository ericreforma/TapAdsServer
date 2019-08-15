import { GOOGLE_API } from '../config/variable';

export const GOOGLE_MAPS = {
    extendBounds: (google, bounds, coordinates, dataName) => {
        coordinates.map(c => {
            bounds.extend(plotPoints(google, dataName, c));
        });
    },
    fitBounds: (google, bounds) => {
        google.map.fitBounds(bounds);
        google.map.panToBounds(bounds);
    },
    getPoints: (google, points, dataName) => {
        var latLngPoints = points.map(p => plotPoints(google, dataName, p));
        return latLngPoints;
    },
    heatmap: (google, data) => {
        var returnHeatmap = new google.maps.visualization.HeatmapLayer({
            map: google.map,
            data: data,
            gradient: GOOGLE_API.heatmap_gradient
        });
        return returnHeatmap;
    },
    createPolygon: (google, path) => {
        var polygon = new google.maps.Polygon({
            map: google.map,
            path: path,
            strokeColor: '#33BD4E',
            strokeOpacity: 0.8,
            fillColor: '#33BD4E',
            fillOpacity: 0.2,
            strokeWeight: 3,
        });
        return polygon;
    }
};

const plotPoints = (google, name, coordinate) => {
    var returnCoor = new google.maps.LatLng(coordinate[name.lat], coordinate[name.lng]);
    return returnCoor;
};