import React from "react";
import { FaGithub, FaHistory } from "react-icons/fa";


function HeaderWidget() {
    return (
        <div className='flex flex-row bg-white text-white py-4 justify-between items-center'>
        <div className='text-green-500 p-1.5 ml-5 text-xl font-semibold rounded-lg'>
          Take Home Project Demo
        </div>
        {/*filter and github button */}
        <div className='flex flex-row mr-5 justify-between'>
          <button className="p-2 hover:bg-green-200 rounded-md cursor-pointer">
            <FaHistory className="w-8 h-8 text-green-500"/>
          </button>
          <button 
            className="ml-3 p-2 hover:bg-green-200 rounded-md cursor-pointer" 
            onClick={() => {window.open('https://github.com/svmnikhil', '_blank')}}>
            <FaGithub className='w-8 h-8 text-green-500'/>
          </button>
        </div>
      </div>
    );
}

export default HeaderWidget;