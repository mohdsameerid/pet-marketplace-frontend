'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils/format';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, isLoading, fetchAll, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AuthGuard>
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
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    n.isRead
                      ? 'bg-white border-gray-100 shadow-sm'
                      : 'bg-rose-50 border-rose-100 shadow-sm cursor-pointer hover:bg-rose-100'
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
      </AuthGuard>
      <Footer />
    </div>
  );
}
