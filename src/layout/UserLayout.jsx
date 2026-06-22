import React from 'react'

import UserDashboard from '../pages/UserDashboard'
import Header from '../components/Header'
import Footer from '../components/Footer'

const UserLayout = () => {
  return (
<div>
    <Header />
    <UserDashboard />
    <Footer />
</div>
  )
}

export default UserLayout
