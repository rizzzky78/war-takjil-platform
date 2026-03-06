import { defineEventHandler, getHeader, createError } from 'h3'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-cron-secret')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || secret !== cronSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Initialize Firebase (if not already initialized)
  const config = useRuntimeConfig()

  let app
  if (getApps().length === 0) {
    app = initializeApp({
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId
    })
  } else {
    app = getApp()
  }

  const db = getFirestore(app)
  const spotsRef = collection(db, 'spots')

  try {
    const now = Date.now()
    // Query expired spots
    const q = query(spotsRef, where('expiresAt', '<=', now))
    const snapshot = await getDocs(q)

    let deletedCount = 0

    // Delete them
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    deletedCount = deletePromises.length

    return {
      success: true,
      message: `Cleaned up ${deletedCount} expired spots.`,
      deletedCount
    }
  } catch (error: any) {
    console.error('Error cleaning up spots:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: error.message
    })
  }
})
