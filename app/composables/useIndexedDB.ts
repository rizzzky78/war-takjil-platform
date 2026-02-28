import { openDB, type IDBPDatabase } from 'idb'
import { CACHE_TTL_5_MINS } from '../utils/constants'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const DB_NAME = 'wartakjil_cache_db'
const DB_VERSION = 1
const STORE_NAME = 'geohash_spots'

let dbPromise: Promise<IDBPDatabase> | null = null

const initDB = () => {
  if (!import.meta.client) return null // Client-side only

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

export const useIndexedDB = () => {
  const getCache = async <T>(key: string): Promise<T | null> => {
    const db = await initDB()
    if (!db) return null

    try {
      const dbEntry = await db.get(STORE_NAME, key) as CacheEntry<T> | undefined
      if (dbEntry) {
        // Validation for TTL
        if (Date.now() - dbEntry.timestamp < CACHE_TTL_5_MINS) {
          return dbEntry.data
        } else {
          // Expired
          await db.delete(STORE_NAME, key)
        }
      }
    } catch (err) {
      console.warn('Failed to read from IDB cache:', err)
    }

    return null
  }

  const setCache = async <T>(key: string, data: T) => {
    const db = await initDB()
    if (!db) return

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now()
      }
      await db.put(STORE_NAME, entry, key)
    } catch (err) {
      console.warn('Failed to write to IDB cache:', err)
    }
  }

  const clearCache = async () => {
    const db = await initDB()
    if (!db) return
    try {
      await db.clear(STORE_NAME)
    } catch (err) {
      console.warn('Failed to clear IDB cache:', err)
    }
  }

  const cleanupExpiredCache = async () => {
    const db = await initDB()
    if (!db) return

    try {
      const keys = await db.getAllKeys(STORE_NAME)
      for (const key of keys) {
        const entry = await db.get(STORE_NAME, key) as CacheEntry<any> | undefined
        // If entry is older than TTL, delete it
        if (entry && Date.now() - entry.timestamp >= CACHE_TTL_5_MINS) {
          await db.delete(STORE_NAME, key)
        }
      }
    } catch (err) {
      console.warn('Failed to cleanup IDB cache:', err)
    }
  }

  return {
    getCache,
    setCache,
    clearCache,
    cleanupExpiredCache
  }
}
