import React from 'react';

const Topbar = () => {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const userName = user.name || 'Administrador';

  return (
    <header className="h-20 border-b border-[#2a2d3e] bg-[#0f111a]/80 backdrop-blur-sm fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8">
      <div className="text-xl font-bold italic tracking-wide">
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-300">{userName}</span>
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Sistema Online
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1db954]/20 border border-[#1db954] text-[#1db954] flex items-center justify-center font-black">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
