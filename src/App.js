import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { FaGithub, FaHistory } from "react-icons/fa";
import MetricsWidget from './components/MetricsWidget';


const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function App() {
  mapboxgl.accessToken = TOKEN;
  const mapContainer = useRef();

  const [population, setPopulation] = useState(500000);
  const [income, setIncome] = useState(90000);
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [-122.4, 37.8],
      zoom: 12
    });

    map.on("load", () => {

      map.addSource("neighbourhoods", {
        type:"geojson",
        data: ""
      });
    });

    return () => map.remove();
  },[]);
 
  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      {/* Header */}
      <div className='flex flex-row bg-white text-white py-4 justify-between items-center'>
        <div className='text-green-500 p-1.5 ml-5 text-lg font-semibold rounded-lg'>
          Take Home Demo
        </div>
        {/*filter and github button */}
        <div className='flex flex-row mr-5 justify-between'>
          <button className="p-2 hover:bg-green-200 rounded-md cursor-pointer">
            <FaHistory className="w-8 h-7 text-green-500"/>
          </button>
          <button 
            className="ml-3 p-2 hover:bg-green-200 rounded-md cursor-pointer" 
            onClick={() => {window.open('https://github.com/svmnikhil', '_blank')}}>
            <FaGithub className='w-8 h-7 text-green-500'/>
          </button>
        </div>
      </div>

      {/* Map and metrics widget, slider, and calculate button */}
      <div className='relative flex-grow justify-center items-center'>
        <div ref={mapContainer} className='absolute top-2 right-2 bottom-2 left-2'></div>

        <div className='absolute bottom-4 right-4 flex flex-col items-end'>
          <MetricsWidget population={population} income={income}/>
          <button 
            className="bg-green-500 text-white shadow-md font-bold p-2 w-64 rounded-lg mt-3" 
            onClick={() => {}}>
            Calculate
          </button>
        </div>
      </div>
    </div>

  );
}

export default App;


