'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { authApi } from '@/lib/api/auth';
import { User } from '@/types';
import { formatDate } from '@/lib/utils/format';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  LayoutDashboard,
  Heart,
  MessageCircle,
} from 'lucide-react';

const roleBadgeClass: Record<string, string> = {
  Buyer:  'bg-blue-100 text-blue-700',
  Seller: 'bg-rose-100 text-rose-700',
  Admin:  'bg-purple-100 text-purple-700',
};

function ProfileContent() {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.getMe();
      setProfile(res.data.data);
    } catch {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    document.title = 'My Profile — PetMarketplace';
  }, []);

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <UserIcon size={22} className="text-rose-500" />
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProfile} />
      ) : profile ? (
        <div className="space-y-4">
          {/* Profile card */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-2xl font-bold">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
                  {profile.role && (
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadgeClass[profile.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {profile.role}
                    </span>
                  )}
                  {profile.role === 'Seller' && profile.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  )}
                  {profile.role === 'Seller' && !profile.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      <Clock size={12} />
                      Pending Verification
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={15} className="text-gray-400 shrink-0" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={15} className="text-gray-400 shrink-0" />
                      <span>{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={15} className="text-gray-400 shrink-0" />
                      <span>{profile.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              {profile.role === 'Seller' && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  My Dashboard
                </Link>
              )}
              {profile.role === 'Buyer' && (
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <Heart size={16} />
                  My Favorites
                </Link>
              )}
              {(profile.role === 'Buyer' || profile.role === 'Seller') && (
                <Link
                  href="/inquiries"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <MessageCircle size={16} />
                  My Inquiries
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
      <Footer />
    </div>
  );
}
