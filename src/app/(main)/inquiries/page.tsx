'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { inquiriesApi } from '@/lib/api/inquiries';
import { Inquiry } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function InquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await inquiriesApi.getMyInquiries();
      setInquiries(res.data.data);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openThread = async (inquiry: Inquiry) => {
    try {
      const res = await inquiriesApi.getById(inquiry.id);
      setSelected(res.data.data);
    } catch {
      setSelected(inquiry);
    }
  };

  const handleSend = async () => {
    if (!selected || !message.trim()) return;
    setSending(true);
    try {
      const res = await inquiriesApi.sendMessage(selected.id, message);
      setSelected((prev) => prev ? { ...prev, messages: [...prev.messages, res.data.data] } : prev);
      setMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AuthGuard>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle size={22} className="text-rose-500" />
            <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
            {inquiries.length > 0 && <span className="text-sm text-gray-500">({inquiries.length})</span>}
          </div>

          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center"><Spinner size="lg" /></div>
          ) : inquiries.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
              <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">No inquiries yet</p>
              <p className="text-sm text-gray-400 mb-5">Contact sellers on listings you&apos;re interested in</p>
              <Link href="/listings"><Button>Browse Pets</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => openThread(inq)}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex gap-4 items-start cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-rose-50">
                    {inq.listingMainImageUrl ? (
                      <Image src={inq.listingMainImageUrl} alt={inq.listingTitle} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🐾</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{inq.listingTitle}</h3>
                    <p className="text-sm font-bold text-rose-500">{formatPrice(inq.listingPrice)}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{inq.messages.length} message{inq.messages.length !== 1 ? 's' : ''}</span>
                      <span>Started {formatDate(inq.createdAt)}</span>
                    </div>
                    {inq.messages.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {inq.messages[inq.messages.length - 1].senderName}: {inq.messages[inq.messages.length - 1].message}
                      </p>
                    )}
                  </div>
                  <MessageCircle size={18} className="shrink-0 text-gray-300 mt-1" />
                </div>
              ))}
            </div>
          )}
        </main>
      </AuthGuard>

      {/* Thread Modal */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setMessage(''); }} title={selected?.listingTitle} maxWidth="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {selected.messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {!isMe && <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderName}</p>}
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-rose-100' : 'text-gray-400'}`}>
                        {formatDate(msg.sentAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                maxLength={1000}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              />
              <Button onClick={handleSend} isLoading={sending} disabled={!message.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
