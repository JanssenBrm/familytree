import {bbox, centroid, featureCollection} from '@turf/turf';


export const getCenter = (feature: GeoJSON.Feature): GeoJSON.Feature<GeoJSON.Point> => {
    return centroid(feature)
}

export const getExtent = (features: GeoJSON.Feature[]): number[] => {
    return bbox(featureCollection(features));
};