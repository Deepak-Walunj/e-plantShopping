import React from 'react';
import { useNavigate } from 'react-router-dom';
import AboutUs from '@components/pages/landing/AboutUs';
import '@components/pages/css/App.css';
import landing_bg from "@assets/backgrounds/landing_bg.jpg"
import { userSignupApi } from '@/repository/UserRepo';
import { ENTITY } from '@utils/Constants';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignin = () => {
    navigate('/auth/login');
  };

  const handleSignup = () => {
    navigate('/auth/signup');
  };

  const handleDemoLogin = () => {
    try {
      const response = userSignupApi({ userType: ENTITY.DEMO })
      console.log('Local Signup Success:', response);
      navigate('/user/products')
    } catch (error) {
      console.error("Local Signup error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }

  return (
    <div className="app-container">
      <div className="landing-page">
        <div className="landing-overlay"></div>
        <div className="landing-bg-anim" style={{ backgroundImage: `url(${landing_bg})` }}></div>
        <div className="content">
          <div className="landing_content">
            <h1>Welcome To Paradise Nursery</h1>
            <div className="divider"></div>
            <p>Where Green Meets Serenity</p>
            <div className="button-container">
              <button type="button" className="get-started-button" onClick={handleSignin}>
                Signin
              </button>
              <button type="button" className="get-started-button" onClick={handleSignup}>
                Signup
              </button>
              <button type="button" className="get-started-button" onClick={handleDemoLogin}>
                Demo Login
              </button>
            </div>
          </div>
          <div className="aboutus_container">
            <AboutUs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
