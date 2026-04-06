// Auth
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  profileImageUrl?: string;
  role: 'Buyer' | 'Seller' | 'Admin';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  city?: string;
  role: 'Buyer' | 'Seller';
}

// Listings
export type Species = 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Rabbit' | 'Other';
export type Gender = 'Male' | 'Female';
export type ListingStatus = 'Draft' | 'PendingApproval' | 'Active' | 'Rejected' | 'Sold';
export type SortBy = 'Newest' | 'PriceLow' | 'PriceHigh' | 'MostViewed';

export interface ListingImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  species: Species;
  breed?: string;
  ageMonths: number;
  gender: Gender;
  city: string;
  status: ListingStatus;
  rejectionReason?: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  isVetChecked: boolean;
  viewCount: number;
  sellerId: string;
  sellerName: string;
  isSellerVerified: boolean;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  species: string;
  breed?: string;
  ageMonths: number;
  gender: string;
  city: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  isVetChecked: boolean;
}

export interface ListingFilter {
  species?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  minAge?: number;
  maxAge?: number;
  gender?: string;
  isVaccinated?: boolean;
  sortBy?: SortBy;
  pageNumber?: number;
  pageSize?: number;
}

// Pagination
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Favorites
export interface Favorite {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingCity: string;
  mainImageUrl?: string;
  listingStatus: string;
  createdAt: string;
}

// Inquiries
export interface InquiryMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  sentAt: string;
}

export interface Inquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  listingMainImageUrl?: string;
  listingPrice: number;
  buyerId: string;
  buyerName: string;
  createdAt: string;
  messages: InquiryMessage[];
}

// Reviews
export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerImageUrl?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SellerReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
