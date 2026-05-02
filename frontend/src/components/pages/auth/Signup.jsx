import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '@/components/pages/css/Login.css';
import { useGoogleLogin } from "@react-oauth/google";
import { userSignupApi, googleOauthApi } from '@/repository/UserRepo';
import { AUTH_PROVIDER } from '@/utils/Constants';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        name,
        email,
        password,
        authProvider: AUTH_PROVIDER.LOCAL
      };
      const response = await userSignupApi(userData);
      console.log('Local Signup Success:', response);
      toast.success(response.message);
      navigate('/auth/login');
    } catch (err) {
      console.error("Local Signup error:", err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const oauthResponse = await googleOauthApi(tokenResponse.access_token);
        const userInfo = oauthResponse?.data;

        if (!userInfo || !userInfo.email) {
          throw new Error("Failed to fetch user info from Google");
        }

        const userData = {
          name: userInfo.name,
          email: userInfo.email,
          authProvider: AUTH_PROVIDER.GOOGLE,
          googleId: userInfo.sub
        };

        const response = await userSignupApi(userData);
        console.log('Google Signup Success:', response);
        toast.success(response.message);
        navigate('/auth/login');
      } catch (err) {
        console.error("Google login error:", err);
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google Login failed.");
      console.log("Google Login failed");
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us to start curating your plants</p>

        <button type="button" onClick={() => googleLogin()} className="google-btn" disabled={loading}>
          <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          {loading ? "Signing up..." : "Sign up with Google"}
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleEmailSignup} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/auth/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
