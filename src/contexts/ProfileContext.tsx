'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Profile {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProfileContextType {
  activeProfile: Profile | null
  setActiveProfile: (profile: Profile | null) => void
  profiles: Profile[]
  setProfiles: (profiles: Profile[]) => void
  isLoading: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load profiles on mount
  useEffect(() => {
    loadProfiles()
  }, [])

  // Load active profile from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('activeProfile')
    if (stored) {
      setActiveProfile(JSON.parse(stored))
    }
  }, [])

  // Save active profile to localStorage when it changes
  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('activeProfile', JSON.stringify(activeProfile))
    } else {
      localStorage.removeItem('activeProfile')
    }
  }, [activeProfile])

  const loadProfiles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profiles')
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        setActiveProfile,
        profiles,
        setProfiles,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
