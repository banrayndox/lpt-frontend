import React from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Auth from '../pages/Auth'
import MaintenanceDashboard from '../pages/MaintanceDashboard'

const MaintanceLayout = () => {
  return (
<div>
    <Header />
    <MaintenanceDashboard />
    <Footer />
</div>
  )
}

export default MaintanceLayout
