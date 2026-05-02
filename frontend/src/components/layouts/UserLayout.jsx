import React from 'react';
import { Outlet } from 'react-router-dom';
import '@/components/pages/css/App.css'; 

const UserLayout = () => {
  return (
    <div className="app-container">
      {/* You can add a user navigation bar here later */}
      <Outlet />
    </div>
  );
};

export default UserLayout;
