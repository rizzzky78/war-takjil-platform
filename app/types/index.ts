export type TakjilSpot = {
  id: string

  // Location
  location: {
    latitude: number
    longitude: number
    geohash: string
  }
  locationName: string
  address?: string

  // Status
  status: 'available' | 'low_stock' | 'sold_out'
  lastStatusUpdate: number

  // Info
  description?: string
  priceRange?: 'under_10k' | '10k_20k' | 'above_20k'

  // Images (max 3)
  images: Array<{
    url: string
    thumbnailUrl: string
    publicId: string
    uploadedAt: number
    uploadedBy: string
    type: 'booth' | 'menu'
  }>

  // Metadata
  createdAt: number
  createdBy: string
  reportCount: number
  lastReportedAt: number

  // Seller features
  isSellerManaged: boolean
  sellerContact?: string

  expiresAt: number

  // Abuse Reports Tracking
  abuseReportsCount?: Record<AbuseReportReason, number>

  comments?: SpotComment[]
}

export type SpotComment = {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: number
  updatedAt?: number
}

export type AbuseReportReason = 'fraud' | 'misinformation' | 'inappropriate_image' | 'closed_permanently' | 'other';

export type AbuseReport = {
  id: string
  spotId: string
  reason: AbuseReportReason
  note?: string
  reportedBy: string
  reportedAt: number
}

export type SpotReport = {
  id: string
  spotId: string

  status: 'available' | 'low_stock' | 'sold_out'
  note?: string
  images?: Array<{
    url: string
    thumbnailUrl: string
    publicId: string
  }>

  reportedBy: string
  reportedAt: number
  isVerified: boolean

  expiresAt: number
}

export type AppUser = {
  id: string
  email: string
  name: string
  photoUrl?: string

  reportsCount: number
  verifiedReports: number
  createdAt: number

  isSeller: boolean
  managedSpots: string[]
}
