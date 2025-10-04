'use client';
import React from 'react'
import Navbar from '@/components/Navbar'
// import Box from './components/box'
import Grid from './components/grid'
import Banner from './components/banner'
import Footer from '@/components/Footer'
import Selector from './components/selector'
import { useAuth } from '@/store/hooks'
import { useGetCurrentUserQuery } from '@/store/slices/authSlice'

const Dashboard = () => {
  // Authentication hooks
  const { user, isAuthenticated } = useAuth()
  const { data: currentUserData } = useGetCurrentUserQuery()

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: unknown) => {
    if (!profileImage) return null
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && (profileImage as any).data && (profileImage as any).contentType) {
      const dataUrl = `data:${(profileImage as any).contentType};base64,${((profileImage as any).data as { toString: (encoding: string) => string }).toString('base64')}`
      return dataUrl
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && (profileImage as any).url) {
      if ((profileImage as any).url.startsWith('http')) return (profileImage as any).url
      return `https://res.cloudinary.com/demo/image/fetch/${(profileImage as any).url}`
    }
    
    return null
  }

  return (
    <div className='w-full'>
      <Navbar 
        user={user || undefined}
        currentUserData={currentUserData}
        isAuthenticated={isAuthenticated}
        forceHomepageStyle={true}
        getProfileImageUrl={getProfileImageUrl}
      />
      <Banner/>

      <main className='max-w-screen-xl mx-auto px-4'>  
        <Selector/>
        <Grid/>
      </main>
      
      <Footer/>
    </div>
  )
}

export default Dashboard