import React from 'react';
import { UserGroupIcon, CashIcon } from '@heroicons/react/solid';

function MetricsWidget({ population, income }) {
  return (
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
  );
}

export default MetricsWidget;
