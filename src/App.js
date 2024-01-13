import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Control } from 'mapbox-gl';
import HeaderWidget from './components/HeaderWidget';
import ControlsWidget from './components/ControlsWidget';
import circle from '@turf/circle';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function App() {
  mapboxgl.accessToken = "pk.eyJ1Ijoic3ZtbmlraGlsIiwiYSI6ImNscjl6a2FoNDA4MWwyam5zMWFyNno5OXUifQ.3xWsTTo62GCXyMKNcaS8kQ";
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [lng, setLng] = useState(-122.4);
  const [lat, setLat] = useState(37.8);
  const [radius, setRadius] = useState(4);
  const [options, setOptions] = useState({steps: 64, units: 'kilometers'});
  
  useEffect(() => {
    //check if there exists a map yet...
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
          'id': 'circle-style',
          'type': 'fill',
          'source': 'circle',
          'layout': {},
          'paint': {
            'fill-color': '#a1a1aa',
            'fill-opacity': 0.35
          }
        });
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


