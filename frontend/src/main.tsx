import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Events from './pages/admin/Events'
import Sliders from './pages/admin/Sliders'
import Users from './pages/admin/Users'
import { Navigate } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/events/:id',
    element: <EventDetail />,
  },
  {
    path: '/checkout/:bookingId',
    element: <Checkout />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'events',
        element: <Events />,
      },
      {
        path: 'sliders',
        element: <Sliders />,
      },
      {
        path: 'users',
        element: <Users />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" richColors />
  </StrictMode>,
)
