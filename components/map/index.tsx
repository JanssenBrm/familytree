'use client';

// eslint-disable-next-line
import mapboxgl from '!mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useEffect, useRef} from 'react';
import {Person} from "@/stores/family/model";
import {ToastType} from "@/stores/toasts/model";
import {useToastsStore} from "@/stores/toasts";
import {getExtent} from "@/components/map/utils";
import {featureCollection} from "@turf/turf";
import {GeoJSON} from "geojson";


const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY
mapboxgl.accessToken = mapboxToken

interface MapProps {
    people: Person[]
}


const Map = ({people}: MapProps) => {

    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.Map>(null);
    const {addToast} = useToastsStore((state) => state);

    const flyToLocations = (features: GeoJSON.Feature[]) => {
        if (map.current && features.length > 0) {
            const extent = getExtent(features);
            map.current.fitBounds(extent, {
                padding: 50,
                duration: 4000
            })
        }
    }

    const showHeatMap = (locations: GeoJSON.Feature[]) => {
        const sourceId = 'heatmap'
        const source = map.current.getSource(sourceId);
        const data = featureCollection(locations);
        if (!source) {
            map.current.addSource(sourceId, {
                type: 'geojson',
                cluster: true,
                data
            });

            map.current.addLayer(
                {
                    id: sourceId,
                    type: 'heatmap',
                    source: sourceId,
                    paint: {
                        'heatmap-weight': {
                            type: 'identity',
                            property: 'count'
                        }
                    }
                }
            );
        } else {
            source.setData(data);
        }
    }
    const getLocation = (location: string) =>
        fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${location}&access_token=${mapboxToken}`)
            .then((response) => response.json())
            .then((collection) => collection.features.find((f: any) => f.properties.context.country.country_code == "BE" && f.properties.name_preferred === location))

    useEffect(() => {
        if (map.current && people.length > 0) {
            const locations = people
                .filter((p: Person) => !!p.birthcity)
                .map((p: Person) => p.birthcity)
            Promise.all(locations
                .filter((city: string, idx: number, cities: string[]) => cities.indexOf(city) === idx)
                .map((location: string) => getLocation(location).catch((error) => {
                    console.error(`Could not translate location ${location}`, error);
                    addToast({
                        message: `Sorry! Kon de locatie ${location} niet ophalen`,
                        type: ToastType.ERROR
                    });
                    return undefined
                }))
            ).then((features: any) =>
                features
                    .filter((feature: any) => !!feature)
                    .map((feature: any) =>
                        ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                count: locations.filter(l => l === feature.properties.name_preferred).length
                            }
                        })
                    ))
                .then((features) => {
                    console.log(features);
                    flyToLocations(features);
                    showHeatMap(features);
                }).catch((error) => {
                console.error(`Could not translate locations`, error);
                addToast({
                    message: 'Sorry! Kon de locaties niet ophalen',
                    type: ToastType.ERROR
                });

            })
        }
    }, [map.current, people]);


    useEffect(() => {
        if (map.current) return; // initialize map only once
        const mp = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            zoom: 1.5,
            center: [30, 50],
            projection: 'globe'
        });

        mp.on('style.load', () => {
            mp.setFog({
                color: 'rgb(186, 210, 235)', // Lower atmosphere
                'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
                'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
                'space-color': 'rgb(11, 11, 25)', // Background color
                'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
            });
        });

        map.current = mp;
    }, []);

    return <div className='w-screen h-screen'>
        <div ref={mapContainer} className='w-full h-full'/>
    </div>
}

export default Map;