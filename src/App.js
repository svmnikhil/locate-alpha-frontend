/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import HeaderWidget from './components/HeaderWidget';
import ControlsWidget from './components/ControlsWidget';
import circle from '@turf/circle';
import rewind from '@turf/rewind';
import { feature } from '@turf/helpers';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const apiUrl = process.env.REACT_APP_API_URL;


function App() {
  mapboxgl.accessToken = TOKEN;
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [lng, setLng] = useState(-96.454968);
  const [lat, setLat] = useState(33.332216);
  const [radius, setRadius] = useState(4);
  const [options, setOptions] = useState({steps: 64, units: 'kilometers'});
  
  useEffect(() => {

    const fetchNeighbourhoodData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/neighbourhoods`);
        const neighbourhoodData = await response.json();
        return neighbourhoodData;
      } catch (error) {
        console.error("Error fetching neighbourhood data:", error);
      }
    }

    const loadData = async () => {
      const neighbourhoodData = await fetchNeighbourhoodData(); // Await the data
      const extractedSpatialObjects = neighbourhoodData.map(item => item.spatialObj);
      const rewindedSpatialObjects = extractedSpatialObjects.map(item => rewind(item));
      const featurizedSpatialObjects = rewindedSpatialObjects.map(item => feature(item));
  
      map.current.addSource("neighbourhoods", {
        type: "geojson",
        data: 
        {
          'type': 'FeatureCollection',
          'features': featurizedSpatialObjects
          
        }
      });

      map.current.addLayer({
        'id': 'neighbourhood-style',
        'type': 'fill',
        'source': 'neighbourhoods',
        'paint': {
          'fill-color': '#99f6e4',
          'fill-opacity': 0.35
        }
      });

      map.current.addLayer({
        'id': 'neighbourhood-outline',
        'type': 'line',
        'source': 'neighbourhoods',
        'layout': {},
        'paint': {
        'line-color': '#2dd4bf',
        'line-width': 1
        }
        });
    };

    //check if there exists a map yet
    if (!map.current) {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 12
      });
  
      map.current.on("load", () => {
        map.current.addSource("circle", {
          type: "geojson",
          data: circle([lng, lat], radius, options)
        });
  
        map.current.addLayer({
          'id': 'polygon-style',
          'type': 'fill',
          'source': 'circle',
          'layout': {},
          'paint': {
            'fill-color': '#404040',
            'fill-opacity': 0.35
          }
        });
        loadData();
      });

      
    
    }

    const updateCircle = () => {
      const currentCenter = map.current.getCenter();
      const newCircleData = circle([currentCenter.lng.toFixed(4), currentCenter.lat.toFixed(4)], radius, options);
      if (map.current.getSource('circle')) {
        map.current.getSource('circle').setData(newCircleData);
      }
    }

    // when the map moves, the updateCircle method is called to render a newCircle
    map.current.on('move', updateCircle);
    
    updateCircle();

    // Cleanup function to remove the event listener
    return () => {
      if (map.current) {
        map.current.off('move', updateCircle);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[radius, options]);

 
  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      {/* Header */}
      <HeaderWidget />

      {/* Map and the ControlsWidget */}
      <div className='relative flex-grow justify-center items-center'>

        <div ref={mapContainer} className='absolute top-2 right-2 bottom-2 left-2'></div>

        <div className='absolute bottom-4 right-4 flex flex-col items-end'>
          <ControlsWidget radius={radius} setRadius={setRadius}/>
        </div>

      </div>
    </div>

  );
}

export default App;


