import React, {useState} from 'react';
import "../index";
import { UserGroupIcon, CashIcon } from '@heroicons/react/solid';



function ControlsWidget({radius, setRadius}) {

  const [population, setPopulation] = useState(500000);
  const [income, setIncome] = useState(90000);

  return (
    <div>
      <div className='bg-white w-64 shadow-md rounded-lg'>
        <div className='flex flex-row justify-between bg-neutral-200 p-2 rounded-t-lg'>
          <div className='flex flex-row items-center font-bold'>
            <UserGroupIcon className='w-4 h-4 text-black mr-1'/>
            population 
          </div>
          <div className='ml-4'>{population}</div>
        </div>
      
        <div className='flex flex-row justify-between p-2'>
          <div className='flex flex-row items-center font-bold'>
            <CashIcon className='w-4 h-4 text-black mr-1'/>
            income
          </div>
          <div className='ml-4'>{income}</div>
        </div>
      </div>

      <div className='relative flex flex-row my-4 items-center justify-between'>
        <div className='mr-3'>{radius} km</div>
        <input 
          type='range'
          min='1'
          max="50"
          value={radius}
          className='w-48 h-2 bg-neutral appearance-none cursor-pointer rounded-lg slider-thumb'
          onChange={({target: {value: distance}}) => {
            setRadius(distance);
          }}/>
      </div>

      <button 
        className="bg-green-500 text-white shadow-md font-bold p-2 w-64 rounded-lg" 
        onClick={() => {}}>
        Calculate
      </button>
    </div>
    
  );
}

export default ControlsWidget;
