'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { listingsApi } from '@/lib/api/listings';
import { favoritesApi } from '@/lib/api/favorites';
import { inquiriesApi } from '@/lib/api/inquiries';
import { reviewsApi } from '@/lib/api/reviews';
import { Listing, SellerReviewSummary } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatAge, formatDate } from '@/lib/utils/format';
import {
  Heart, MapPin, Eye, ShieldCheck, MessageCircle,
  Star, ChevronLeft, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const inquirySchema = Yup.object({
  initialMessage: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message cannot exceed 500 characters')
    .required('Message is required'),
});

const reviewSchema = Yup.object({
  rating: Yup.number().min(1, 'Select a rating').max(5).required('Rating is required'),
  comment: Yup.string().max(500, 'Comment cannot exceed 500 characters'),
});

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<SellerReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [inquiryModal, setInquiryModal] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const loadReviews = async (sellerId: string) => {
    const revRes = await reviewsApi.getForSeller(sellerId);
    setReviews(revRes.data.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await listingsApi.getById(id);
        const l = res.data.data;
        document.title = `${l.title} — PetMarketplace`;
        setListing(l);

        const mainIdx = l.images.findIndex((img) => img.isMain);
        if (mainIdx >= 0) setActiveImage(mainIdx);

        await loadReviews(l.sellerId);

        if (isAuthenticated) {
          const favRes = await favoritesApi.check(id);
          setIsFavorited(favRes.data.data);
        }
      } catch {
        toast.error('Listing not found');
        router.replace('/listings');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated, router]);

  const handleFavorite = async () => {
    if (!isAuthenticated) { toast.error('Please log in to save favorites'); return; }
    setFavLoading(true);
    try {
      if (isFavorited) {
        await favoritesApi.remove(id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesApi.add(id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFavLoading(false);
    }
  };

  // Inquiry form
  const inquiryFormik = useFormik({
    initialValues: { initialMessage: '' },
    validationSchema: inquirySchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await inquiriesApi.create(id, values.initialMessage);
        toast.success('Inquiry sent! The seller will reply soon.');
        setInquiryModal(false);
        setInquirySent(true);
        resetForm();
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ??
          'Failed to send inquiry';
        toast.error(message);
      }
    },
  });

  // Review form
  const reviewFormik = useFormik({
    initialValues: { rating: 0, comment: '' },
    validationSchema: reviewSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!listing) return;
      try {
        await reviewsApi.create(listing.sellerId, values.rating, values.comment || undefined);
        toast.success('Review submitted!');
        setReviewSubmitted(true);
        resetForm();
        await loadReviews(listing.sellerId);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ??
          'Failed to submit review';
        toast.error(message);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) return null;

  const canInquire = isAuthenticated && user?.role === 'Buyer' && listing.sellerId !== user?.id;
  const hasAlreadyReviewed = reviews?.reviews.some((r) => r.reviewerId === user?.id) ?? false;
  const canReview = isAuthenticated && user?.role === 'Buyer' && !hasAlreadyReviewed && !reviewSubmitted && listing.sellerId !== user?.id;
  const isActive = listing.status === 'Active';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to listings
        </button>

        {/* Status banner for non-Active listings */}
        {!isActive && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-orange-50 border border-orange-200 px-5 py-4">
            <AlertTriangle size={20} className="shrink-0 text-orange-500" />
            <div>
              <p className="font-semibold text-orange-800">This listing is no longer available</p>
              <p className="text-sm text-orange-600 mt-0.5">
                Status: <span className="font-medium capitalize">{listing.status}</span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-rose-50">
              {listing.images[activeImage] ? (
                <Image
                  src={listing.images[activeImage].imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl">🐾</div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {listing.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-rose-500 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.imageUrl} alt={`${listing.title} thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <button
                  onClick={handleFavorite}
                  disabled={favLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 hover:bg-rose-50 transition-colors"
                >
                  <Heart size={20} className={isFavorited ? 'fill-rose-500 text-rose-500' : 'text-gray-400'} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="rose">{listing.species}</Badge>
                {listing.breed && <Badge>{listing.breed}</Badge>}
                <Badge variant={listing.gender === 'Male' ? 'info' : 'rose'}>{listing.gender}</Badge>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye size={12} /> {listing.viewCount} views
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-500">{formatPrice(listing.price)}</span>
              {listing.isNegotiable && (
                <span className="text-sm text-green-600 font-medium">Negotiable</span>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Age', value: formatAge(listing.ageMonths) },
                { label: 'City', value: listing.city, icon: <MapPin size={13} /> },
                { label: 'Listed', value: formatDate(listing.createdAt) },
                { label: 'Seller', value: listing.sellerName },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    {item.icon}
                    {item.value}
                    {item.label === 'Seller' && listing.isSellerVerified && (
                      <ShieldCheck size={13} className="text-green-500 ml-0.5" />
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Health */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Health Info</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Vaccinated', ok: listing.isVaccinated },
                  { label: 'Neutered', ok: listing.isNeutered },
                  { label: 'Vet Checked', ok: listing.isVetChecked },
                ].map((h) => (
                  <div key={h.label} className="flex flex-col items-center gap-1">
                    {h.ok ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-gray-300" />
                    )}
                    <span className="text-xs text-gray-600">{h.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* CTA */}
            {canInquire && !inquirySent && isActive && (
              <Button onClick={() => setInquiryModal(true)} size="lg" className="w-full">
                <MessageCircle size={18} />
                Contact Seller
              </Button>
            )}
            {canInquire && inquirySent && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                <CheckCircle2 size={20} className="text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-700">Inquiry sent! Check your inquiries page for replies.</p>
              </div>
            )}
            {!isAuthenticated && (
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full">
                  Log in to Contact Seller
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.totalReviews > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Seller Reviews</h2>
              <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 border border-yellow-100 px-3 py-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-800">{reviews.averageRating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({reviews.totalReviews})</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.reviews.slice(0, 4).map((review) => (
                <div key={review.id} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm font-semibold">
                        {review.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
                        <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={`${review.id}-star-${i}`} size={13} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review form — Buyers only, one per seller */}
        {canReview && (
          <div className="mt-10 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Rate this Seller</h2>
            <form onSubmit={reviewFormik.handleSubmit} className="space-y-4">
              {/* Star rating */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => reviewFormik.setFieldValue('rating', star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={
                          star <= (hoverRating || reviewFormik.values.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                        }
                      />
                    </button>
                  ))}
                </div>
                {reviewFormik.touched.rating && reviewFormik.errors.rating && (
                  <p className="mt-1 text-xs text-red-500">{reviewFormik.errors.rating}</p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Comment <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="comment"
                  value={reviewFormik.values.comment}
                  onChange={reviewFormik.handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Share your experience with this seller..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none"
                />
                {reviewFormik.touched.comment && reviewFormik.errors.comment && (
                  <p className="mt-1 text-xs text-red-500">{reviewFormik.errors.comment}</p>
                )}
                <p className="text-xs text-gray-400 text-right mt-0.5">{reviewFormik.values.comment.length}/500</p>
              </div>

              <Button type="submit" isLoading={reviewFormik.isSubmitting} disabled={reviewFormik.values.rating === 0}>
                Submit Review
              </Button>
            </form>
          </div>
        )}
      </main>

      {/* Inquiry Modal */}
      <Modal isOpen={inquiryModal} onClose={() => { setInquiryModal(false); inquiryFormik.resetForm(); }} title="Contact Seller">
        <form onSubmit={inquiryFormik.handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Send a message about <span className="font-medium text-gray-900">{listing.title}</span>
          </p>
          <div>
            <textarea
              name="initialMessage"
              value={inquiryFormik.values.initialMessage}
              onChange={inquiryFormik.handleChange}
              onBlur={inquiryFormik.handleBlur}
              placeholder="Hi, I'm interested in your pet. Is it still available?"
              rows={4}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:border-transparent resize-none ${
                inquiryFormik.touched.initialMessage && inquiryFormik.errors.initialMessage
                  ? 'border-red-400 bg-red-50 focus:ring-red-300'
                  : 'border-gray-200 focus:ring-rose-400'
              }`}
            />
            {inquiryFormik.touched.initialMessage && inquiryFormik.errors.initialMessage && (
              <p className="mt-1 text-xs text-red-500">{inquiryFormik.errors.initialMessage}</p>
            )}
            <p className="text-xs text-gray-400 text-right mt-0.5">{inquiryFormik.values.initialMessage.length}/500</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => { setInquiryModal(false); inquiryFormik.resetForm(); }} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={inquiryFormik.isSubmitting} className="flex-1">
              Send Message
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
