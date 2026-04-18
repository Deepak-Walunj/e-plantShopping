import React, { useState } from 'react';
import ProductList from '@/components/pages/cart/ProductList';
import '@/components/pages/css/App.css';
import AboutUs from '@/components/pages/landing/AboutUs';
import Login from '@/components/pages/auth/Login';
import Signup from '@/components/pages/auth/Signup';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); 
  // 'landing', 'login', 'signup', 'products'

  const handleGetStartedClick = () => {
    setCurrentPage('login');
  };

  const handleHomeClick = () => {
    setCurrentPage('landing');
  };

  const navigateToLogin = () => {
    setCurrentPage('login');
  };

  const navigateToSignup = () => {
    setCurrentPage('signup');
  };

  const handleAuthSuccess = () => {
    setCurrentPage('products');
  };

  return (
    <div className="app-container">
      <div className={`landing-page ${currentPage === 'products' ? 'fade-out' : ''}`}>
        <div className="background-image"></div>
          <div className="content">
            <div className="landing_content">
              <h1>Welcome To Paradise Nursery</h1>
                <div className="divider"></div>
                  <p>Where Green Meets Serenity</p>
                  <button className="get-started-button" onClick={handleGetStartedClick}>
                  Get Started
                  </button>
                </div>
              <div className="aboutus_container">
              <AboutUs/>
            </div>
          </div>
      </div>

      {currentPage === 'login' && (
        <Login 
          onLoginSuccess={handleAuthSuccess}
          onNavigateToSignup={navigateToSignup} 
        />
      )}

      {currentPage === 'signup' && (
        <Signup 
          onSignupSuccess={handleAuthSuccess}
          onNavigateToLogin={navigateToLogin} 
        />
      )}

      <div className={`product-list-container ${currentPage === 'products' ? 'visible' : ''}`}>
        <ProductList onHomeClick={handleHomeClick}/>
      </div>
    </div>
  );
}

export default App;



