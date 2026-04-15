'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { listingsApi } from '@/lib/api/listings';
import { favoritesApi } from '@/lib/api/favorites';
import { inquiriesApi } from '@/lib/api/inquiries';
import { useAuth } from '@/context/AuthContext';
import { Listing, ListingStatus, PagedResult, Favorite, Inquiry } from '@/types';
import { formatPrice, formatDate, formatAge } from '@/lib/utils/format';
import {
  Plus, Edit2, Trash2, Send, Upload, Eye, Star, ShieldCheck,
  Heart, MessageCircle, MapPin, Search, LayoutDashboard, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'];

const statusBadge: Record<ListingStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'danger' | 'info' | 'rose' }> = {
  Draft: { label: 'Draft', variant: 'default' },
  PendingApproval: { label: 'Pending Review', variant: 'warning' },
  Active: { label: 'Active', variant: 'success' },
  Rejected: { label: 'Rejected', variant: 'danger' },
  Sold: { label: 'Sold', variant: 'info' },
};

// ─── Validation schemas ────────────────────────────────────────────────────────

const createSchema = Yup.object({
  title: Yup.string().min(5, 'Min 5 chars').max(200, 'Max 200 chars').required('Title is required'),
  description: Yup.string().min(20, 'Min 20 chars').max(2000, 'Max 2000 chars').required('Description is required'),
  price: Yup.number().min(0, 'Min 0').max(10_000_000, 'Max 10,000,000').required('Price is required'),
  species: Yup.string().required('Species is required'),
  breed: Yup.string().max(100, 'Max 100 chars'),
  ageMonths: Yup.number().min(0, 'Min 0').max(300, 'Max 300 months').required('Age is required'),
  gender: Yup.string().required('Gender is required'),
  city: Yup.string().min(2, 'Min 2 chars').max(100, 'Max 100 chars').required('City is required'),
  isNegotiable: Yup.boolean(),
  isVaccinated: Yup.boolean(),
  isNeutered: Yup.boolean(),
  isVetChecked: Yup.boolean(),
});

const editSchema = Yup.object({
  title: Yup.string().min(5, 'Min 5 chars').max(200, 'Max 200 chars').required('Title is required'),
  description: Yup.string().min(20, 'Min 20 chars').max(2000, 'Max 2000 chars').required('Description is required'),
  price: Yup.number().min(0, 'Min 0').max(10_000_000, 'Max 10,000,000').required('Price is required'),
  breed: Yup.string().max(100, 'Max 100 chars'),
  ageMonths: Yup.number().min(0, 'Min 0').max(300, 'Max 300 months').required('Age is required'),
  city: Yup.string().min(2, 'Min 2 chars').max(100, 'Max 100 chars').required('City is required'),
  isNegotiable: Yup.boolean(),
  isVaccinated: Yup.boolean(),
  isNeutered: Yup.boolean(),
  isVetChecked: Yup.boolean(),
});

// ─── Create form ───────────────────────────────────────────────────────────────

function CreateListingForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const formik = useFormik({
    initialValues: {
      title: '', description: '', price: 0, isNegotiable: false,
      species: 'Dog', breed: '', ageMonths: 1, gender: 'Male',
      city: '', isVaccinated: false, isNeutered: false, isVetChecked: false,
    },
    validationSchema: createSchema,
    onSubmit: async (values) => {
      await listingsApi.create({ ...values, breed: values.breed || undefined });
      toast.success('Listing created as Draft. Upload images and submit for approval.');
      onSuccess();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input label="Title" placeholder="Golden Retriever Puppy" name="title"
            value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.title ? formik.errors.title : undefined} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Species <span className="text-rose-500">*</span></label>
          <select name="species" value={formik.values.species} onChange={formik.handleChange}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400">
            {SPECIES_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Gender <span className="text-rose-500">*</span></label>
          <select name="gender" value={formik.values.gender} onChange={formik.handleChange}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400">
            <option>Male</option><option>Female</option>
          </select>
        </div>
        <Input label="Breed" placeholder="e.g. Siberian Husky" name="breed"
          value={formik.values.breed} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.breed ? formik.errors.breed : undefined} />
        <Input label="Age (months)" type="number" min={0} name="ageMonths"
          value={formik.values.ageMonths} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.ageMonths ? formik.errors.ageMonths : undefined} required />
        <Input label="Price (₹)" type="number" min={0} name="price"
          value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.price ? formik.errors.price : undefined} required />
        <Input label="City" placeholder="Mumbai" name="city"
          value={formik.values.city} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.city ? formik.errors.city : undefined} required />
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1">Description <span className="text-rose-500">*</span></label>
          <textarea name="description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}
            rows={3} maxLength={2000} placeholder="Describe your pet..."
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none ${formik.touched.description && formik.errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`} />
          {formik.touched.description && formik.errors.description && (
            <p className="text-xs text-red-500 mt-0.5">{formik.errors.description}</p>
          )}
        </div>
        <div className="col-span-2 flex flex-wrap gap-4">
          {([
            { key: 'isNegotiable', label: 'Negotiable' },
            { key: 'isVaccinated', label: 'Vaccinated' },
            { key: 'isNeutered', label: 'Neutered' },
            { key: 'isVetChecked', label: 'Vet Checked' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" name={key}
                checked={formik.values[key] as boolean}
                onChange={formik.handleChange}
                className="h-4 w-4 rounded accent-rose-500" />
              {label}
            </label>
          ))}
        </div>
      </div>
      {formik.errors.price && formik.touched.price && (
        <p className="text-xs text-red-500">{formik.errors.price}</p>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" isLoading={formik.isSubmitting} className="flex-1">Create Listing</Button>
      </div>
    </form>
  );
}

// ─── Edit form ─────────────────────────────────────────────────────────────────

function EditListingForm({ listing, onSuccess, onClose }: { listing: Listing; onSuccess: () => void; onClose: () => void }) {
  const formik = useFormik({
    initialValues: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      isNegotiable: listing.isNegotiable,
      breed: listing.breed ?? '',
      ageMonths: listing.ageMonths,
      city: listing.city,
      isVaccinated: listing.isVaccinated,
      isNeutered: listing.isNeutered,
      isVetChecked: listing.isVetChecked,
    },
    validationSchema: editSchema,
    onSubmit: async (values) => {
      await listingsApi.update(listing.id, { ...values, breed: values.breed || undefined });
      toast.success('Listing updated!');
      onSuccess();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input label="Title" name="title"
            value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.title ? formik.errors.title : undefined} required />
        </div>
        <Input label="Breed" name="breed"
          value={formik.values.breed} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.breed ? formik.errors.breed : undefined} />
        <Input label="Age (months)" type="number" min={0} name="ageMonths"
          value={formik.values.ageMonths} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.ageMonths ? formik.errors.ageMonths : undefined} required />
        <Input label="Price (₹)" type="number" min={0} name="price"
          value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.price ? formik.errors.price : undefined} required />
        <Input label="City" name="city"
          value={formik.values.city} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.city ? formik.errors.city : undefined} required />
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1">Description <span className="text-rose-500">*</span></label>
          <textarea name="description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur}
            rows={3} maxLength={2000}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none ${formik.touched.description && formik.errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`} />
          {formik.touched.description && formik.errors.description && (
            <p className="text-xs text-red-500 mt-0.5">{formik.errors.description}</p>
          )}
        </div>
        <div className="col-span-2 flex flex-wrap gap-4">
          {([
            { key: 'isNegotiable', label: 'Negotiable' },
            { key: 'isVaccinated', label: 'Vaccinated' },
            { key: 'isNeutered', label: 'Neutered' },
            { key: 'isVetChecked', label: 'Vet Checked' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" name={key}
                checked={formik.values[key] as boolean}
                onChange={formik.handleChange}
                className="h-4 w-4 rounded accent-rose-500" />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" isLoading={formik.isSubmitting} className="flex-1">Save Changes</Button>
      </div>
    </form>
  );
}

// ─── Image Management Modal ────────────────────────────────────────────────────

function ImageModal({ listing, onClose, onRefresh }: { listing: Listing; onClose: () => void; onRefresh: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const upload = async () => {
    if (!file) return;
    if (listing.images.length >= 6) { toast.error('Max 6 images per listing'); return; }
    if (file.size / 1024 / 1024 > 5) { toast.error('File must be under 5MB'); return; }
    setUploading(true);
    try {
      await listingsApi.uploadImage(listing.id, file);
      toast.success('Image uploaded!');
      setFile(null);
      onRefresh();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    setActionLoading(imageId);
    try {
      await listingsApi.deleteImage(listing.id, imageId);
      toast.success('Image deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const setMain = async (imageId: string) => {
    setActionLoading(imageId + '-main');
    try {
      await listingsApi.setMainImage(listing.id, imageId);
      toast.success('Main image updated');
      onRefresh();
    } catch {
      toast.error('Failed to set main image');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{listing.images.length}/6 images</p>

      {listing.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {listing.images.map((img) => (
            <div key={img.id} className="relative group">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-rose-50">
                <Image src={img.imageUrl} alt={`${listing.title} image`} fill className="object-cover" sizes="120px" />
                {img.isMain && (
                  <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-yellow-400 px-1.5 py-0.5">
                    <Star size={9} className="fill-white text-white" />
                    <span className="text-[9px] font-bold text-white">Main</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!img.isMain && (
                  <button
                    onClick={() => setMain(img.id)}
                    disabled={actionLoading === img.id + '-main'}
                    className="rounded-full bg-yellow-400 p-1.5 text-white hover:bg-yellow-500 transition-colors"
                    title="Set as main"
                  >
                    <ShieldCheck size={12} />
                  </button>
                )}
                <button
                  onClick={() => deleteImage(img.id)}
                  disabled={actionLoading === img.id}
                  className="rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {listing.images.length < 6 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Upload new image</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-50 file:text-rose-600 file:font-medium hover:file:bg-rose-100"
          />
          <Button onClick={upload} isLoading={uploading} disabled={!file} className="w-full">
            <Upload size={15} /> Upload Image
          </Button>
        </div>
      )}

      <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
    </div>
  );
}

// ─── Seller Dashboard ──────────────────────────────────────────────────────────

function SellerDashboard() {
  const [data, setData] = useState<PagedResult<Listing> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [imageListing, setImageListing] = useState<Listing | null>(null);

  const load = async (p = page) => {
    setIsLoading(true);
    try {
      const res = await listingsApi.getMyListings(p);
      setData(res.data.data);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleSubmitForApproval = async (id: string, hasImages: boolean) => {
    if (!hasImages) { toast.error('Upload at least 1 image before submitting'); return; }
    try {
      await listingsApi.submit(id);
      toast.success('Submitted for approval!');
      load(page);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ?? 'Failed to submit';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    try {
      await listingsApi.delete(id);
      toast.success('Listing deleted');
      load(page);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const listings = data?.items ?? [];

  return (
    <>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={22} className="text-rose-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
              {data && (
                <p className="text-sm text-gray-500 mt-0.5">{data.totalCount} listing{data.totalCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <Button onClick={() => setCreateModal(true)}>
            <Plus size={16} />
            New Listing
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
            <span className="text-5xl block mb-3">🐾</span>
            <p className="text-gray-600 font-medium mb-1">No listings yet</p>
            <p className="text-sm text-gray-400 mb-5">Create your first pet listing to get started</p>
            <Button onClick={() => setCreateModal(true)}>
              <Plus size={16} /> Create Listing
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => {
              const s = statusBadge[listing.status];
              const canEdit = listing.status === 'Draft' || listing.status === 'Rejected';
              const canSubmit = canEdit;
              const canDelete = listing.status !== 'Active' && listing.status !== 'Sold';
              const canManageImages = listing.status === 'Draft' || listing.status === 'Rejected';

              return (
                <div key={listing.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {listing.images.length > 0 && (
                    <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-rose-50">
                      <Image
                        src={(listing.images.find((i) => i.isMain) ?? listing.images[0]).imageUrl}
                        alt={listing.title}
                        fill className="object-cover" sizes="64px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span>{listing.species}{listing.breed ? ` · ${listing.breed}` : ''}</span>
                      <span>{formatAge(listing.ageMonths)}</span>
                      <span>{formatPrice(listing.price)}</span>
                      <span>{listing.city}</span>
                      <span>{formatDate(listing.createdAt)}</span>
                      <span>{listing.images.length} image{listing.images.length !== 1 ? 's' : ''}</span>
                    </div>
                    {listing.status === 'Rejected' && listing.rejectionReason && (
                      <p className="mt-1 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1 inline-block">
                        Rejected: {listing.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Link href={`/listings/${listing.id}`}>
                      <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                        <Eye size={13} /> View
                      </button>
                    </Link>

                    {canEdit && (
                      <button
                        onClick={() => setEditListing(listing)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    )}

                    {canManageImages && (
                      <button
                        onClick={() => setImageListing(listing)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Upload size={13} /> Images
                      </button>
                    )}

                    {canSubmit && (
                      <button
                        onClick={() => handleSubmitForApproval(listing.id, listing.images.length > 0)}
                        className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Send size={13} /> Submit
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        )}
      </main>

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Listing" maxWidth="lg">
        <CreateListingForm
          onSuccess={() => { setCreateModal(false); load(page); }}
          onClose={() => setCreateModal(false)}
        />
      </Modal>

      <Modal isOpen={!!editListing} onClose={() => setEditListing(null)} title="Edit Listing" maxWidth="lg">
        {editListing && (
          <EditListingForm
            listing={editListing}
            onSuccess={() => { setEditListing(null); load(page); }}
            onClose={() => setEditListing(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!imageListing} onClose={() => setImageListing(null)} title="Manage Images" maxWidth="md">
        {imageListing && (
          <ImageModal
            listing={imageListing}
            onClose={() => setImageListing(null)}
            onRefresh={async () => {
              await load(page);
              setImageListing((prev) => {
                if (!prev) return null;
                const updated = data?.items.find((l) => l.id === prev.id);
                return updated ?? prev;
              });
            }}
          />
        )}
      </Modal>
    </>
  );
}

// ─── Buyer Dashboard ───────────────────────────────────────────────────────────

function BuyerDashboard() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [favTotal, setFavTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [favRes, inqRes] = await Promise.all([
          favoritesApi.getMyFavorites(1, 4),
          inquiriesApi.getMyInquiries(),
        ]);
        setFavorites(favRes.data.data.items);
        setFavTotal(favRes.data.data.totalCount);
        setInquiries(inqRes.data.data.slice(0, 4));
      } catch {
        // silently fail — individual sections show empty states
      } finally {
        setIsLoading(false);
      }
    };
    load();
    document.title = 'My Dashboard — PetMarketplace';
  }, []);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Welcome header */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-2xl font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Buyer</span>
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                <Heart size={18} className="text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{favTotal}</p>
                <p className="text-xs text-gray-500 mt-0.5">Favorites</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <MessageCircle size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Inquiries</p>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-rose-500 shadow-sm p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-400">
                <Search size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Find a pet</p>
                <Link href="/listings" className="text-xs text-rose-100 hover:text-white transition-colors">Browse listings →</Link>
              </div>
            </div>
          </div>

          {/* Recent Favorites */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Heart size={16} className="text-rose-500" /> Recent Favorites
              </h2>
              <Link href="/favorites" className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
                View all →
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
                <Heart size={36} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No favorites yet</p>
                <Link href="/listings">
                  <Button size="sm" className="mt-3">Browse Pets</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/listings/${fav.listingId}`}
                    className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 flex items-center gap-3 hover:border-rose-200 hover:shadow-md transition-all"
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-rose-50">
                      {fav.mainImageUrl ? (
                        <Image src={fav.mainImageUrl} alt={fav.listingTitle} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">🐾</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{fav.listingTitle}</p>
                      <p className="text-sm font-bold text-rose-500 mt-0.5">{formatPrice(fav.listingPrice)}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />{fav.listingCity}
                      </p>
                    </div>
                    {fav.listingStatus !== 'Active' && (
                      <span className="shrink-0 text-xs text-orange-500 font-medium">{fav.listingStatus}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Inquiries */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <MessageCircle size={16} className="text-blue-500" /> Recent Inquiries
              </h2>
              <Link href="/inquiries" className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
                View all →
              </Link>
            </div>

            {inquiries.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
                <MessageCircle size={36} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No inquiries yet</p>
                <p className="text-xs text-gray-400 mt-1">Contact a seller from any listing page</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inquiries.map((inq) => {
                  const lastMsg = inq.messages[inq.messages.length - 1];
                  return (
                    <Link
                      key={inq.id}
                      href="/inquiries"
                      className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 flex items-center gap-3 hover:border-rose-200 hover:shadow-md transition-all"
                    >
                      <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-rose-50">
                        {inq.listingMainImageUrl ? (
                          <Image src={inq.listingMainImageUrl} alt={inq.listingTitle} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">🐾</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{inq.listingTitle}</p>
                        {lastMsg ? (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.senderName}: {lastMsg.message}</p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-0.5">No messages yet</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(inq.createdAt)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/listings">
                <Button><Search size={15} /> Browse Pets</Button>
              </Link>
              <Link href="/favorites">
                <Button variant="outline"><Heart size={15} /> My Favorites</Button>
              </Link>
              <Link href="/inquiries">
                <Button variant="outline"><MessageCircle size={15} /> My Inquiries</Button>
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ProtectedRoute allowedRoles={['Buyer', 'Seller']}>
        {user?.role === 'Seller' ? <SellerDashboard /> : <BuyerDashboard />}
      </ProtectedRoute>
      <Footer />
    </div>
  );
}
