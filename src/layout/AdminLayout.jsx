import React from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Auth from '../pages/Auth'
import AdminDashboard from '../pages/AdminDashboard'

const AdminLayout = () => {
  return (
<div>
    <Header />
    <AdminDashboard />
    <Footer />
</div>
  )
}

export default AdminLayout
