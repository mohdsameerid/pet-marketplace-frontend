'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { inquiriesApi } from '@/lib/api/inquiries';
import { listingsApi } from '@/lib/api/listings';
import { Inquiry, Listing } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const messageSchema = Yup.object({
  message: Yup.string()
    .min(1, 'Message is required')
    .max(1000, 'Message cannot exceed 1000 characters')
    .required('Message is required'),
});

// ─── Thread panel ──────────────────────────────────────────────────────────────

function ThreadPanel({ inquiry, userId, onMessageSent }: {
  inquiry: Inquiry;
  userId: string;
  onMessageSent: (updated: Inquiry) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const formik = useFormik({
    initialValues: { message: '' },
    validationSchema: messageSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Optimistic UI: add message immediately
        const optimistic = {
          id: `temp-${Date.now()}`,
          senderId: userId,
          senderName: 'You',
          senderRole: '',
          message: values.message,
          sentAt: new Date().toISOString(),
        };
        onMessageSent({ ...inquiry, messages: [...inquiry.messages, optimistic] });
        resetForm();

        // Send and refetch for accurate data
        await inquiriesApi.sendMessage(inquiry.id, values.message);
        const res = await inquiriesApi.getById(inquiry.id);
        onMessageSent(res.data.data);
      } catch {
        toast.error('Failed to send message');
      }
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [inquiry.messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-rose-50">
          {inquiry.listingMainImageUrl ? (
            <Image src={inquiry.listingMainImageUrl} alt={inquiry.listingTitle} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="flex h-full items-center justify-center text-lg">🐾</div>
          )}
        </div>
        <div className="min-w-0">
          <Link href={`/listings/${inquiry.listingId}`} className="font-semibold text-gray-900 hover:text-rose-600 transition-colors truncate block">
            {inquiry.listingTitle}
          </Link>
          <p className="text-xs text-gray-500">{formatPrice(inquiry.listingPrice)} · {inquiry.buyerName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {inquiry.messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No messages yet
          </div>
        )}
        {inquiry.messages.map((msg) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                isMe ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                {!isMe && <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderName}</p>}
                <p className="leading-relaxed">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-rose-100' : 'text-gray-400'}`}>
                  {formatDate(msg.sentAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <form onSubmit={formik.handleSubmit} className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <textarea
            name="message"
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Type your message..."
            rows={2}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formik.handleSubmit();
              }
            }}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none ${
              formik.touched.message && formik.errors.message
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-transparent'
            }`}
          />
          <Button type="submit" isLoading={formik.isSubmitting} disabled={!formik.values.message.trim()}>
            <Send size={16} />
          </Button>
        </div>
        {formik.touched.message && formik.errors.message && (
          <p className="mt-1 text-xs text-red-500">{formik.errors.message}</p>
        )}
      </form>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function InquiriesContent() {
  const { user } = useAuth();
  const isSeller = user?.role === 'Seller';

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  // Seller-specific state
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [listingsLoading, setListingsLoading] = useState(false);

  // Load seller's listings on mount (for the listing selector)
  useEffect(() => {
    if (!isSeller) return;
    const fetchListings = async () => {
      setListingsLoading(true);
      try {
        const res = await listingsApi.getMyListings(1, 50);
        const items = res.data.data.items;
        setMyListings(items);
        if (items.length > 0) setSelectedListingId(items[0].id);
      } catch {
        // ignore
      } finally {
        setListingsLoading(false);
      }
    };
    fetchListings();
  }, [isSeller]);

  // Buyer: load all inquiries
  const loadBuyerInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await inquiriesApi.getMyInquiries();
      const list = res.data.data;
      setInquiries(list);
      if (list.length > 0) openThread(list[0]);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  // Seller: load inquiries for selected listing
  const loadSellerInquiries = async (listingId: string) => {
    if (!listingId) return;
    setIsLoading(true);
    try {
      const res = await inquiriesApi.getForListing(listingId);
      const list = res.data.data;
      setInquiries(list);
      setSelected(null);
      if (list.length > 0) openThread(list[0]);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSeller) {
      loadBuyerInquiries();
    }
  }, [isSeller]);

  useEffect(() => {
    if (isSeller && selectedListingId) {
      loadSellerInquiries(selectedListingId);
    }
  }, [isSeller, selectedListingId]);

  const openThread = async (inquiry: Inquiry) => {
    try {
      const res = await inquiriesApi.getById(inquiry.id);
      setSelected(res.data.data);
    } catch {
      setSelected(inquiry);
    }
  };

  const handleMessageSent = (updated: Inquiry) => {
    setSelected(updated);
    setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const isEmpty = !isLoading && inquiries.length === 0;

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={22} className="text-rose-500" />
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        {inquiries.length > 0 && <span className="text-sm text-gray-500">({inquiries.length})</span>}
      </div>

      {/* Seller: listing selector */}
      {isSeller && (
        <div className="mb-4">
          {listingsLoading ? (
            <Spinner size="sm" />
          ) : myListings.length === 0 ? (
            <p className="text-sm text-gray-500">No listings yet.</p>
          ) : (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by listing:</label>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="flex-1 max-w-sm rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400"
              >
                {myListings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
          <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">No inquiries yet</p>
          <p className="text-sm text-gray-400 mb-5">
            {isSeller ? 'Inquiries on this listing will appear here' : 'Contact sellers on listings you\'re interested in'}
          </p>
          {!isSeller && (
            <Link href="/listings"><Button>Browse Pets</Button></Link>
          )}
        </div>
      ) : (
        <div className="flex-1 flex gap-4 min-h-0" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Left: inquiry list */}
          <div className="w-80 shrink-0 flex flex-col gap-2 overflow-y-auto">
            {inquiries.map((inq) => {
              const lastMsg = inq.messages[inq.messages.length - 1];
              const isActive = selected?.id === inq.id;
              return (
                <button
                  key={inq.id}
                  onClick={() => openThread(inq)}
                  className={`w-full text-left rounded-2xl border p-3 flex gap-3 items-start transition-all ${
                    isActive
                      ? 'border-rose-400 bg-rose-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-rose-200 hover:bg-rose-50/50 shadow-sm'
                  }`}
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
                    {isSeller && (
                      <p className="text-xs text-rose-600 font-medium truncate">{inq.buyerName}</p>
                    )}
                    {lastMsg ? (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {lastMsg.senderName}: {lastMsg.message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">No messages yet</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(inq.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: thread */}
          <div className="flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {selected ? (
              <ThreadPanel
                inquiry={selected}
                userId={user?.id ?? ''}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function InquiriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ProtectedRoute allowedRoles={['Buyer', 'Seller']}>
        <InquiriesContent />
      </ProtectedRoute>
      <Footer />
    </div>
  );
}
