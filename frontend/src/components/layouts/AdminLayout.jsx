import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Basic Admin Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#333', color: '#fff', padding: '20px' }}>
        <h2>Admin Panel</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ margin: '10px 0' }}><Link to="/admin" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link></li>
          {/* Add more admin links here */}
        </ul>
      </aside>
      
      {/* Admin Content Area */}
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#f4f4f4' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
