'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils/format';
import { Bell, CheckCheck } from 'lucide-react';

// Best-effort: extract first UUID from notification message to navigate to a listing
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function extractListingId(text: string): string | null {
  return text.match(UUID_RE)?.[0] ?? null;
}

function NotificationsContent() {
  const router = useRouter();
  const { notifications, isLoading, fetchAll, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleClick = async (id: string, isRead: boolean, title: string, message: string) => {
    if (!isRead) await markAsRead(id);

    // Try to navigate to the related listing (best effort)
    const listingId = extractListingId(title) ?? extractListingId(message);
    if (listingId) router.push(`/listings/${listingId}`);
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell size={22} className="text-rose-500" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={15} />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
          <Bell size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">You&apos;ll be notified about inquiries and listing updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n.id, n.isRead, n.title, n.message)}
              className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-gray-100 shadow-sm hover:bg-gray-50'
                  : 'bg-rose-50 border-rose-100 shadow-sm hover:bg-rose-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  n.isRead ? 'bg-gray-100' : 'bg-rose-200'
                }`}>
                  <Bell size={15} className={n.isRead ? 'text-gray-400' : 'text-rose-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="shrink-0 flex h-2 w-2 rounded-full bg-rose-500 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ProtectedRoute>
        <NotificationsContent />
      </ProtectedRoute>
      <Footer />
    </div>
  );
}
