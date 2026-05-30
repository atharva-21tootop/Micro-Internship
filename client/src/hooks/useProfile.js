import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, storage } from '@/services/firebase/client'
import { getUser, createOrUpdateUser } from '@/services/userService'
import { subscribeToApplicationsByStudent } from '@/services/applicationService'
import { subscribeToUserAchievements } from '@/services/achievementService'
import { subscribeToInternships } from '@/services/internshipService'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { validateProfileForm } from '@/utils/profileUtils'

export const EMPTY_PROFILE_FORM = {
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  phone: '',
  year: '',
  branch: '',
  rollNumber: '',
  dateOfBirth: '',
  address: '',
  bio: '',
  skills: [],
  interests: [],
  github: '',
  linkedin: '',
  portfolio: '',
  resumeUrl: '',
  projects: [],
  experience: [],
}

const mapUserToForm = (data, fallbackEmail = '') => ({
  firstName: data.firstName || '',
  lastName: data.lastName || '',
  fullName: data.fullName || '',
  email: data.email || fallbackEmail || '',
  phone: data.phone || '',
  year: data.year || '',
  branch: data.branch || '',
  rollNumber: data.rollNumber || '',
  dateOfBirth: data.dateOfBirth || '',
  address: data.address || '',
  bio: data.bio || '',
  skills: data.skills || [],
  interests: data.interests || [],
  github: data.github || '',
  linkedin: data.linkedin || '',
  portfolio: data.portfolio || '',
  resumeUrl: data.resumeUrl || '',
  projects: data.projects || [],
  experience: data.experience || [],
})

export const useProfile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState(EMPTY_PROFILE_FORM)
  const [applications, setApplications] = useState([])
  const [achievements, setAchievements] = useState([])
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingResume, setUploadingResume] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/login')
        return
      }

      setUser(firebaseUser)
      const data = await getUser(firebaseUser.uid)
      if (data) {
        setUserData(data)
        setFormData(mapUserToForm(data, firebaseUser.email))
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!user) return undefined
    return subscribeToApplicationsByStudent(user.uid, setApplications)
  }, [user])

  useEffect(() => {
    if (!user) return undefined
    return subscribeToUserAchievements(user.uid, (data) => {
      setAchievements(data.filter((item) => item.earned))
    })
  }, [user])

  useEffect(() => {
    if (!user) return undefined
    return subscribeToInternships(setInternships)
  }, [user])

  const refreshUser = useCallback(async () => {
    if (!user) return null
    const data = await getUser(user.uid)
    if (data) {
      setUserData(data)
      setFormData(mapUserToForm(data, user.email))
    }
    return data
  }, [user])

  const saveProfile = useCallback(async (payload = formData) => {
    if (!user) return false

    const validation = validateProfileForm(payload)
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]
      throw new Error(firstError || 'Please fix profile validation errors')
    }

    await createOrUpdateUser(user.uid, {
      ...payload,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
      updatedAt: new Date().toISOString(),
    })

    await refreshUser()
    return true
  }, [user, formData, refreshUser])

  const resetForm = useCallback(() => {
    if (userData) {
      setFormData(mapUserToForm(userData, user?.email))
    }
  }, [userData, user])

  const uploadResume = useCallback(async (file) => {
    if (!user || !file) return null

    if (file.type !== 'application/pdf') {
      throw new Error('Please upload a PDF file only')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    setUploadingResume(true)
    try {
      const resumeRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(resumeRef, file)
      const downloadURL = await getDownloadURL(resumeRef)
      setFormData((prev) => ({ ...prev, resumeUrl: downloadURL }))
      return downloadURL
    } finally {
      setUploadingResume(false)
    }
  }, [user])

  const profile = { ...userData, ...formData }

  return {
    user,
    userData,
    formData,
    setFormData,
    profile,
    applications,
    achievements,
    internships,
    loading,
    uploadingResume,
    saveProfile,
    resetForm,
    refreshUser,
    uploadResume,
  }
}
