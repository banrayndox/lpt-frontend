import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NotHuman from './pages/NotHuman'
import AuthLayout from './layout/AuthLayout'
import UserLayout from './layout/UserLayout'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './utilities/ProtectedRoutes'
import { Toaster } from 'react-hot-toast';
import MaintanceLayout from './layout/MaintanceLayout'

const App = () => {
  return (

    <Routes>

      <Route path='/' element={<AuthLayout />} />
      <Route path='/nothuman' element={<NotHuman />} />

      <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
        <Route path='/admin' element={<AdminLayout />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
        <Route path='/user' element={<UserLayout />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['Maintance']} />}>
        <Route path='/maintance' element={<MaintanceLayout />} />
      </Route>
      <Route path='*' element={<AuthLayout />} />
    </Routes>
  )
}

export default App