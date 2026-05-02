import React from 'react';
import { Outlet } from 'react-router-dom';
import '@/components/pages/css/App.css'; // or any global styles

const AuthLayout = () => {
  return (
    <div className="app-container">
      {/* You can add auth-specific headers/footers here if needed */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;
