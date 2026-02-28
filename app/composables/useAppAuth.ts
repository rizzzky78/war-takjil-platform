import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { AppUser } from '~/types'

export const useAppAuth = () => {
  const clerk = useClerk()
  const { user: clerkUser } = useUser()
  const { isLoaded, isSignedIn } = useAuth()
  const nuxtApp = useNuxtApp()
  const db = nuxtApp.$db

  const syncUserToFirestore = async () => {
    // Only attempt sync if we are signed in, have a user object, and Firestore is ready
    if (!isSignedIn.value || !clerkUser.value || !db) return

    try {
      const userRef = doc(db, 'users', clerkUser.value.id)
      const userSnap = await getDoc(userRef)

      const name = clerkUser.value.fullName || clerkUser.value.firstName || 'Anonymous'
      const email = clerkUser.value.primaryEmailAddress?.emailAddress || ''
      const photoUrl = clerkUser.value.imageUrl

      if (!userSnap.exists()) {
        const newUser: AppUser = {
          id: clerkUser.value.id,
          email,
          name,
          photoUrl,
          reportsCount: 0,
          verifiedReports: 0,
          createdAt: Date.now(),
          isSeller: false,
          managedSpots: []
        }
        await setDoc(userRef, newUser)
      } else {
        // Update user profile info on each login if changed
        await setDoc(userRef, {
          name,
          photoUrl,
        }, { merge: true })
      }
    } catch (error) {
      console.error('Failed to sync user to Firestore:', error)
    }
  }

  // Watch for truthy isSignedIn to run the sync
  watch(isSignedIn, (loggedIn) => {
    if (loggedIn) {
      syncUserToFirestore()
    }
  }, { immediate: true })

  const signIn = () => {
    if (clerk.value && clerk.value.openSignIn) {
      clerk.value.openSignIn()
    } else {
      console.error('Clerk is not loaded yet')
    }
  }

  const signOut = () => {
    if (clerk.value && clerk.value.signOut) {
      clerk.value.signOut()
    }
  }

  return {
    isLoaded,
    isSignedIn,
    user: clerkUser,
    signIn,
    signOut
  }
}
