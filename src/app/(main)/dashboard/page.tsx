'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { listingsApi } from '@/lib/api/listings';
import { useAuth } from '@/context/AuthContext';
import { Listing, CreateListingRequest, ListingStatus } from '@/types';
import { formatPrice, formatDate, formatAge } from '@/lib/utils/format';
import { Plus, Edit2, Trash2, Send, Upload, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const statusBadge: Record<ListingStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'danger' | 'info' | 'rose' }> = {
  Draft: { label: 'Draft', variant: 'default' },
  PendingApproval: { label: 'Pending Review', variant: 'warning' },
  Active: { label: 'Active', variant: 'success' },
  Rejected: { label: 'Rejected', variant: 'danger' },
  Sold: { label: 'Sold', variant: 'info' },
};

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'];

const emptyForm: CreateListingRequest = {
  title: '', description: '', price: 0, isNegotiable: false,
  species: 'Dog', breed: '', ageMonths: 1, gender: 'Male',
  city: '', isVaccinated: false, isNeutered: false, isVetChecked: false,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState<CreateListingRequest>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const res = await listingsApi.getMyListings();
      setListings(res.data.data.items);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadListings(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await listingsApi.create(form);
      toast.success('Listing created as Draft. Upload images and submit for approval.');
      setCreateModal(false);
      setForm(emptyForm);
      loadListings();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ?? 'Failed to create listing';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await listingsApi.submit(id);
      toast.success('Submitted for approval!');
      loadListings();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ?? 'Failed to submit';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await listingsApi.delete(id);
      toast.success('Listing deleted');
      loadListings();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !imageModal) return;
    setImageLoading(true);
    try {
      await listingsApi.uploadImage(imageModal, imageFile);
      toast.success('Image uploaded!');
      setImageModal(null);
      setImageFile(null);
      loadListings();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ?? 'Failed to upload image';
      toast.error(msg);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AuthGuard>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome, {user?.fullName} · {user?.role}
              </p>
            </div>
            {user?.role === 'Seller' && (
              <Button onClick={() => setCreateModal(true)}>
                <Plus size={16} />
                New Listing
              </Button>
            )}
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
              {user?.role === 'Seller' && (
                <Button onClick={() => setCreateModal(true)}>
                  <Plus size={16} /> Create Listing
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => {
                const status = statusBadge[listing.status];
                return (
                  <div key={listing.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
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
                          Rejection reason: {listing.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/listings/${listing.id}`}>
                        <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                          <Eye size={13} /> View
                        </button>
                      </Link>

                      {(listing.status === 'Draft' || listing.status === 'Rejected') && (
                        <>
                          <button
                            onClick={() => setImageModal(listing.id)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Upload size={13} /> Images
                          </button>
                          <button
                            onClick={() => handleSubmit(listing.id)}
                            className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Send size={13} /> Submit
                          </button>
                        </>
                      )}

                      {listing.status !== 'Active' && listing.status !== 'Sold' && (
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
        </main>
      </AuthGuard>

      {/* Create Listing Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Listing" maxWidth="lg">
        <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input label="Title" placeholder="Golden Retriever Puppy" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Species <span className="text-rose-500">*</span></label>
              <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400">
                {SPECIES_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Gender <span className="text-rose-500">*</span></label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <Input label="Breed" placeholder="e.g. Siberian Husky" value={form.breed ?? ''}
              onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            <Input label="Age (months)" type="number" min={0} value={form.ageMonths}
              onChange={(e) => setForm({ ...form, ageMonths: Number(e.target.value) })} required />
            <Input label="Price (₹)" type="number" min={0} value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            <Input label="City" placeholder="Mumbai" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Description <span className="text-rose-500">*</span></label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} maxLength={2000} placeholder="Describe your pet..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none" required />
            </div>
            <div className="col-span-2 flex flex-wrap gap-4">
              {[
                { key: 'isNegotiable', label: 'Negotiable' },
                { key: 'isVaccinated', label: 'Vaccinated' },
                { key: 'isNeutered', label: 'Neutered' },
                { key: 'isVetChecked', label: 'Vet Checked' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form[key as keyof CreateListingRequest] as boolean}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="h-4 w-4 rounded accent-rose-500" />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={formLoading} className="flex-1">Create Listing</Button>
          </div>
        </form>
      </Modal>

      {/* Image Upload Modal */}
      <Modal isOpen={!!imageModal} onClose={() => { setImageModal(null); setImageFile(null); }} title="Upload Image">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">JPG, PNG, or WEBP · Max 5MB · Up to 6 images</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-rose-50 file:text-rose-600 file:font-medium hover:file:bg-rose-100"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setImageModal(null); setImageFile(null); }} className="flex-1">Cancel</Button>
            <Button onClick={handleImageUpload} isLoading={imageLoading} disabled={!imageFile} className="flex-1">
              <Upload size={15} /> Upload
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
