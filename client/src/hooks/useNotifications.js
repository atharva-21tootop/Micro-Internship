// src/hooks/useNotifications.js
import { useEffect } from 'react'
import { auth } from '@/services/firebase/client'
import { getUser } from '@/services/userService'
import { subscribeToInternships } from '@/services/internshipService'
import { createNotification } from '@/services/notificationService'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase/client'

/**
 * Hook to notify students when new internships match their skills
 */
export const useInternshipNotifications = () => {
  useEffect(() => {
    let lastInternshipCount = 0
    let userSkills = []

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return

      const userData = await getUser(firebaseUser.uid)
      if (userData && userData.role === 'student' && userData.skills) {
        userSkills = userData.skills.map(s => s.toLowerCase())
      }
    })

    const internshipUnsub = subscribeToInternships((internships) => {
      if (internships.length > lastInternshipCount && userSkills.length > 0) {
        // New internship added
        const newInternships = internships.slice(0, internships.length - lastInternshipCount)
        
        newInternships.forEach(async (internship) => {
          if (internship.skills && internship.skills.length > 0) {
            const internshipSkills = internship.skills.map(s => s.toLowerCase())
            const hasMatch = userSkills.some(us => 
              internshipSkills.some(is => is.includes(us) || us.includes(is))
            )

            if (hasMatch && internship.approved !== false && internship.status !== 'pending') {
              // Get all students to notify
              const studentsSnapshot = await getDocs(
                query(collection(db, 'users'), where('role', '==', 'student'))
              )
              
              studentsSnapshot.docs.forEach(async (doc) => {
                const student = doc.data()
                if (student.skills && student.skills.length > 0) {
                  const studentSkills = student.skills.map(s => s.toLowerCase())
                  const matches = internshipSkills.some(is => 
                    studentSkills.some(ss => is.includes(ss) || ss.includes(is))
                  )
                  
                  if (matches) {
                    await createNotification({
                      userId: doc.id,
                      type: 'new_internship',
                      title: 'New Internship Matches Your Skills!',
                      message: `A new internship "${internship.title}" at ${internship.company} matches your skills.`,
                      relatedId: internship.id
                    })
                  }
                }
              })
            }
          }
        })
      }
      lastInternshipCount = internships.length
    })

    return () => {
      unsubscribe()
      internshipUnsub()
    }
  }, [])
}

