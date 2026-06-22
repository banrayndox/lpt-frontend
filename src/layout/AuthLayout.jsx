import React from 'react'
import Auth from '../pages/Auth'
import Header from '../components/Header'
import Footer from '../components/Footer'

const AuthLayout = () => {
  return (
<div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 justify-center items-center">
        <Auth />
      </main>

      <Footer />
    </div>
  )
}

export default AuthLayout