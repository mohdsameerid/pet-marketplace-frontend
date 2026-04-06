import Link from 'next/link';
import { PawPrintBg } from '@/components/ui/PawPrintBg';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500">
              <PawPrintBg size={22} opacity={1} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">
              Pet<span className="text-rose-500">Marketplace</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} PetMarketplace. Find verified pets across India.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/listings" className="hover:text-rose-500 transition-colors">Browse</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
