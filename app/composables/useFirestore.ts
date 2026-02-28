import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, orderBy, limit, startAt, endAt, arrayUnion, arrayRemove } from 'firebase/firestore'
import { useNuxtApp } from '#app'
import { getGeohashBounds } from '../utils/geohash'
import type { TakjilSpot, SpotReport, AppUser, AbuseReport, AbuseReportReason, SpotComment } from '../types'
import { QUERY_LIMIT } from '../utils/constants'

export const useFirestore = () => {
  const { $db } = useNuxtApp()
  const spotsRef = collection($db, 'spots')

  /**
   * Fetch spots within a radius using Geohash bounds
   */
  const getSpotsInRadius = async (lat: number, lng: number, radiusInMeters: number): Promise<TakjilSpot[]> => {
    // get bounding boxes for the radius
    const bounds = getGeohashBounds(lat, lng, radiusInMeters)

    const promises = []

    // We execute a query for each bound
    for (const b of bounds) {
      const q = query(
        spotsRef,
        orderBy('location.geohash'),
        startAt(b[0]),
        endAt(b[1]),
        limit(QUERY_LIMIT)
      )
      promises.push(getDocs(q))
    }

    const snapshots = await Promise.all(promises)
    const matchingDocs: TakjilSpot[] = []

    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const spot = { id: doc.id, ...doc.data() } as TakjilSpot
        // The geoquery bounds are essentially a square, 
        // We could filter exactly by circle radius locally here but for performance 
        // we can just return the bound spots or filter loosely. We'll return everything fetched.
        // We also filter out expired ones just in case TTL hasn't run yet.
        if (spot.expiresAt > Date.now()) {
          matchingDocs.push(spot)
        }
      }
    }

    // Since we queried multiple bounds, there may be duplicates (edge case, but possible)
    const uniqueIds = new Set<string>()
    return matchingDocs.filter(doc => {
      if (!uniqueIds.has(doc.id)) {
        uniqueIds.add(doc.id)
        return true
      }
      return false
    })
  }

  const getSpot = async (spotId: string): Promise<TakjilSpot | null> => {
    const docRef = doc($db, 'spots', spotId)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      const spot = { id: snapshot.id, ...snapshot.data() } as TakjilSpot
      if (spot.expiresAt > Date.now()) return spot
    }
    return null
  }

  const addSpot = async (spot: Omit<TakjilSpot, 'id'>): Promise<string> => {
    const newDocRef = doc(spotsRef)
    await setDoc(newDocRef, { ...spot, id: newDocRef.id })
    return newDocRef.id
  }

  const updateSpot = async (spotId: string, updates: Partial<TakjilSpot>) => {
    const docRef = doc($db, 'spots', spotId)
    await updateDoc(docRef, updates)
  }

  const addReport = async (spotId: string, report: Omit<SpotReport, 'id' | 'spotId'>): Promise<string> => {
    const reportsRef = collection($db, `spots/${spotId}/reports`)
    const newReportRef = doc(reportsRef)
    await setDoc(newReportRef, { ...report, id: newReportRef.id, spotId })
    return newReportRef.id
  }

  const getSpotReports = async (spotId: string): Promise<SpotReport[]> => {
    const reportsRef = collection($db, `spots/${spotId}/reports`)
    const q = query(reportsRef, orderBy('reportedAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpotReport))
  }

  const deleteSpot = async (spotId: string) => {
    const docRef = doc($db, 'spots', spotId)
    await deleteDoc(docRef)
  }

  const getUserProfile = async (userId: string): Promise<AppUser | null> => {
    const docRef = doc($db, 'users', userId)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as AppUser
    }
    return null
  }

  const submitAbuseReport = async (
    spotId: string,
    currentSpot: TakjilSpot,
    report: Omit<AbuseReport, 'id' | 'spotId'>
  ): Promise<{ removed: boolean; id: string }> => {
    // 1. Add report to subcollection
    const abuseReportsRef = collection($db, `spots/${spotId}/abuseReports`)
    const newReportRef = doc(abuseReportsRef)
    await setDoc(newReportRef, { ...report, id: newReportRef.id, spotId })

    // 2. Increment count and fetch new count
    const reason = report.reason
    // Get current count for this specific reason safely
    const currentCount = currentSpot.abuseReportsCount?.[reason] || 0
    const newCount = currentCount + 1

    // 3. Update the spot document
    const spotRef = doc($db, 'spots', spotId)
    const updates: Partial<TakjilSpot> = {
      [`abuseReportsCount.${reason}`]: newCount,
    }

    let removed = false

    // 4. Check deletion threshold (10 reports for the SAME reason)
    if (newCount >= 10) {
      // Set expiresAt to 0 to immediately hide it from client queries 
      // and let Firestore TTL clean it up eventually
      updates.expiresAt = 0
      removed = true
    }

    await updateDoc(spotRef, updates as any) // Typecast due to dot notation

    return { removed, id: newReportRef.id }
  }

  const addComment = async (spotId: string, comment: SpotComment) => {
    const spotRef = doc($db, 'spots', spotId)
    await updateDoc(spotRef, {
      comments: arrayUnion(comment)
    })
  }

  const updateComment = async (spotId: string, oldComment: SpotComment, newComment: SpotComment) => {
    const spotRef = doc($db, 'spots', spotId)
    // Firestore array updates require removing the exact old object, then adding the new one
    await updateDoc(spotRef, {
      comments: arrayRemove(oldComment)
    })
    await updateDoc(spotRef, {
      comments: arrayUnion(newComment)
    })
  }

  const deleteComment = async (spotId: string, comment: SpotComment) => {
    const spotRef = doc($db, 'spots', spotId)
    await updateDoc(spotRef, {
      comments: arrayRemove(comment)
    })
  }

  return {
    getSpotsInRadius,
    getSpot,
    addSpot,
    updateSpot,
    deleteSpot,
    addReport,
    getSpotReports,
    getUserProfile,
    submitAbuseReport,
    addComment,
    updateComment,
    deleteComment
  }
}
