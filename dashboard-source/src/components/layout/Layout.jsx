import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#0f111a] text-gray-200">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col pt-20">
        <Topbar />
        <main className="flex-1 p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
