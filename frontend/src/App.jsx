import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from '@layouts/AuthLayout';
import UserLayout from '@layouts/UserLayout';
import AdminLayout from '@layouts/AdminLayout';
import RootLayout from '@layouts/RootLayout';

// Error Pages
import UnderConstruction from '@pages/error/UnderConstruction';
import UnknownPage from '@pages/error/UnknownPage';

// Pages - Public
import LandingPage from '@pages/landing/LandingPage';

// Pages - Auth
import Login from '@pages/auth/Login';
import Signup from '@pages/auth/Signup';
import VerifyEmail from '@pages/auth/EmailVerificationPage';

// Pages - User
import ProductList from '@pages/cart/ProductList';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <UnderConstruction />,
    children: [
      {
        path: "/",
        element: <LandingPage />
      },
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />
          },
          {
            path: "signup",
            element: <Signup />
          },
          {
            path: "verify-email",
            element: <VerifyEmail />
          },
          {
            path: "resend-verification",
            element: <div>Resend Verification Page (Coming Soon)</div>
          }
        ]
      },
      {
        path: "/user",
        element: <UserLayout />,
        children: [
          {
            path: "products",
            element: <ProductList />
          },
        ]
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <div>Admin Dashboard (Coming Soon)</div>
          },
          {
            path: "products",
            element: <div>Admin Manage Products (Coming Soon)</div>
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <UnknownPage />
  }
]);

export default function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={router} />
    </>
  );
}
