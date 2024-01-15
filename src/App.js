/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import HeaderWidget from './components/HeaderWidget';
import ControlsWidget from './components/ControlsWidget';


import circle from '@turf/circle';
import rewind from '@turf/rewind';
import { feature, featureCollection, point, points, polygon } from '@turf/helpers';
import centroid from '@turf/centroid';
import { getGeom } from '@turf/invariant';
import pointsWithinPolygon from '@turf/points-within-polygon';
import booleanWithin from '@turf/boolean-within';


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
    let hoveredPolygonId = null;

    const loadData = async () => {
       // extract spatialobject from neighbourhood data
      const neighbourhoodData = await fetchNeighbourhoodData(); 
      const modifiedData = neighbourhoodData.map((item, index) => {
        const autoIncrementingId = index + 1;
        const rewindedGeometry = rewind(item.spatialObj);
        const featurizedObject = feature(rewindedGeometry);
        const newFeaturizedObject = {
          ...featurizedObject,
          properties: {
            ...featurizedObject.properties,
            income: item.income,
            population: item.population,
          },
          id: autoIncrementingId
        }
        return newFeaturizedObject;
      });

      const centroidData = modifiedData.map(item => {
        const centroidObj = centroid(item.geometry);
        const incomeObj = item.properties.income;
        const populationObj = item.properties.population;

        const combinedObject = {
          centroid: centroidObj,
          income: incomeObj,
          population: populationObj
        }
        return combinedObject;
      });
     
      // console.log(modifiedData);
      // console.log(centroidData);

      map.current.addSource("neighbourhoods", {
        type: "geojson",
        data: 
        {
          'type': 'FeatureCollection',
          'features': modifiedData
        }
      });

      map.current.addLayer({
        'id': 'neighbourhood-style',
        'type': 'fill',
        'source': 'neighbourhoods',
        'paint': {
          'fill-color': '#99f6e4',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5
          ]
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

      // map.current.addSource("radiusCircle", {
      //   type: "geojson",
      //   data: circle([lng, lat], radius, options)
      // });
        
      // map.current.addLayer({
      //   'id': 'polygon-style',
      //   'type': 'fill',
      //   'source': 'radiusCircle',
      //   'layout': {},
      //   'paint': {
      //     'fill-color': '#404040',
      //     'fill-opacity': 0.35
      //   }
      // });

      map.current.addSource("centroids", {
        type: "geojson",
        data:
        {
          'type': 'FeatureCollection',
          'features': centroidData.map(item => item.centroid)
        }
      });

      map.current.addLayer({
        'id': 'centroid-layer',
        'type': 'circle',
        'source': 'centroids',
        'layout': {},
        'paint': {
          'circle-color': '#4264fb',
          'circle-radius': 2,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#000'
          }
      });

      // when the map moves, the updateCircle method is called to render a newCircle and to recalculate the centroids
      map.current.on('move', () => {
        updateCircle();
        let features = map.current.queryRenderedFeatures({layers: ["centroid-layer"]});  
        // console.log(features);

        let filteredFeatures = features.map(item => {
          const pt = getGeom(item);
          return pt.coordinates;
        });        

        // const pointsFeatureCollection = featureCollection(
        //   filteredFeatures.map(coordinates => point(coordinates))
        // );

        // console.log(circle([lng, lat], radius, options).geometry.coordinates);
        
        // const circleGeom = circle([lng, lat], radius, options);
        // console.log(filteredFeatures);
        // console.log(filteredFeatures.map(item => [item]);
        // // console.log(polygon(circleGeom))
        // // console.log(polygon([circleGeom]));

        // const neighbourhoodsInCircle = pointsWithinPolygon(filteredFeatures, polygon(circleGeom));

        // console.log(neighbourhoodsInCircle);
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
        map.current.addSource("radiusCircle", {
          type: "geojson",
          data: circle([lng, lat], radius, options)
        });
          
        map.current.addLayer({
          'id': 'polygon-style',
          'type': 'fill',
          'source': 'radiusCircle',
          'layout': {},
          'paint': {
            'fill-color': '#404040',
            'fill-opacity': 0.35
          }
        });
        loadData();
      });
    }

    /* This part of the useEffect takes care of all the updates on the map layer */

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.current.on('mouseenter', 'neighbourhood-style', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    // When the user moves their mouse over the neighbourhood, update the feature state for the feature under the mouse.
    map.current.on('mousemove', 'neighbourhood-style', (e) => {
      if (e.features.length > 0) {
        if (hoveredPolygonId !== null) {
          map.current.setFeatureState(
          { source: 'neighbourhoods', id: hoveredPolygonId },
          { hover: false }
          );
        }
        hoveredPolygonId = e.features[0].id;
        map.current.setFeatureState(
          { source: 'neighbourhoods', id: hoveredPolygonId },
          { hover: true }
        );
      }
    });

    // When the mouse leaves the neighbourhood, update the feature state of the previously hovered neighbourhood.
    map.current.on('mouseleave', 'neighbourhood-style', () => {
      map.current.getCanvas().style.cursor = '';
      if (hoveredPolygonId !== null) {
        map.current.setFeatureState(
        { source: 'neighbourhoods', id: hoveredPolygonId },
        { hover: false }
        );
      }
      hoveredPolygonId = null;
    });

    const updateCircle = () => {
      const currentCenter = map.current.getCenter();
      const newCircleData = circle([currentCenter.lng.toFixed(4), currentCenter.lat.toFixed(4)], radius, options);
      if (map.current.getSource('radiusCircle')) {
        map.current.getSource('radiusCircle').setData(newCircleData);
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


