import React from 'react';

const Topbar = () => {
  return (
    <header className="h-20 border-b border-[#2a2d3e] bg-[#0f111a]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="text-xl font-bold italic tracking-wide">
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">Cliente: Cezar</span>
          <span className="text-xs text-gray-400">Site: 3 - cezar.dias@gmail.com</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
          C
        </div>
      </div>
    </header>
  );
};

export default Topbar;
