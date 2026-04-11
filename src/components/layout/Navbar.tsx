'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Heart, MessageCircle, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { PawPrintBg } from '@/components/ui/PawPrintBg';

const roleBadgeClass: Record<string, string> = {
  Buyer:  'bg-blue-100 text-blue-700',
  Seller: 'bg-rose-100 text-rose-700',
  Admin:  'bg-purple-100 text-purple-700',
};

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-sm group-hover:bg-rose-600 transition-colors">
              <PawPrintBg size={26} opacity={1} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Pet<span className="text-rose-500">Marketplace</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/listings"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              Browse Pets
            </Link>

            {isAuthenticated ? (
              <>
                {/* Favorites — Buyers only */}
                {user?.role === 'Buyer' && (
                  <Link
                    href="/favorites"
                    className="relative rounded-lg p-2 text-gray-600 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    title="Favorites"
                  >
                    <Heart size={20} />
                  </Link>
                )}

                {/* Inquiries — Buyers and Sellers */}
                {(user?.role === 'Buyer' || user?.role === 'Seller') && (
                  <Link
                    href="/inquiries"
                    className="relative rounded-lg p-2 text-gray-600 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    title="Inquiries"
                  >
                    <MessageCircle size={20} />
                  </Link>
                )}

                {/* Notifications bell */}
                <Link
                  href="/notifications"
                  className="relative rounded-lg p-2 text-gray-600 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Dashboard — Sellers and Admins */}
                {(user?.role === 'Seller' || user?.role === 'Admin') && (
                  <Link
                    href="/dashboard"
                    className="rounded-lg p-2 text-gray-600 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    title="Dashboard"
                  >
                    <LayoutDashboard size={20} />
                  </Link>
                )}

                <div className="mx-2 h-5 w-px bg-gray-200" />

                {/* User info + role badge */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm font-semibold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col leading-none">
                    <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
                    {user?.role && (
                      <span className={`mt-0.5 inline-flex w-fit rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${roleBadgeClass[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="ml-1 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-rose-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-rose-600 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link href="/listings" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600">
            Browse Pets
          </Link>
          {isAuthenticated ? (
            <>
              {/* Role badge in mobile */}
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
                  {user?.role && (
                    <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${roleBadgeClass[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              {user?.role === 'Buyer' && (
                <Link href="/favorites" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-rose-50">Favorites</Link>
              )}
              {(user?.role === 'Buyer' || user?.role === 'Seller') && (
                <Link href="/inquiries" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-rose-50">Inquiries</Link>
              )}
              <Link href="/notifications" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-rose-50">
                Notifications
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-xs text-white">{unreadCount}</span>
                )}
              </Link>
              {(user?.role === 'Seller' || user?.role === 'Admin') && (
                <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-rose-50">Dashboard</Link>
              )}
              <button onClick={logout} className="block w-full text-left rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-rose-50">Log in</Link>
              <Link href="/register" className="block rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
