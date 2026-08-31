import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import Pricing from './pages/Pricing'
import MeetingRoom from './pages/MeetingRoom'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedLayout from './components/ProtectedLayout'

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
     {/* Public Routes */}
      <Route path="/login/*" element={<Login mode="login" />} />
      <Route path="/register/*" element={<Login mode="register" />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Layout with Navbar & Footer */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          
          {/* Meeting Room (No Navbar/Footer) */}
          <Route path="/meeting/:id" element={<MeetingRoom />} />
        </Route>

        {/* Catch-all unregistered routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App