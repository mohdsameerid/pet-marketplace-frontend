import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { PawPrintBg } from '@/components/ui/PawPrintBg';
import { SpeciesCard } from '@/components/features/listings/SpeciesCard';
import { ShieldCheck, Search, MessageCircle } from 'lucide-react';

// To use real photos: add images to public/species/
// e.g. public/species/dog.jpg, public/species/cat.jpg, etc.
// Falls back to emoji automatically if image is missing.
const SPECIES = [
  { name: 'Dogs',    emoji: '🐶', value: 'Dog',    bgColor: 'bg-amber-200',  imagePath: '/species/dog.jpg'    },
  { name: 'Cats',    emoji: '🐱', value: 'Cat',    bgColor: 'bg-slate-600',  imagePath: '/species/cat.jpg'    },
  { name: 'Rabbits', emoji: '🐰', value: 'Rabbit', bgColor: 'bg-pink-300',   imagePath: '/species/rabbit.jpg' },
  { name: 'Birds',   emoji: '🐦', value: 'Bird',   bgColor: 'bg-sky-300',    imagePath: '/species/bird.jpg'   },
  { name: 'Fish',    emoji: '🐠', value: 'Fish',   bgColor: 'bg-cyan-300',   imagePath: '/species/fish.jpg'   },
  { name: 'Others',  emoji: '🐾', value: 'Other',  bgColor: 'bg-purple-200', imagePath: '/species/other.jpg'  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Sellers',
    desc: 'Every seller is reviewed and verified by our admin team before listings go live.',
  },
  {
    icon: Search,
    title: 'Smart Filters',
    desc: 'Filter by species, breed, price, age, city and more to find your perfect pet.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Messaging',
    desc: 'Contact sellers directly through our secure inquiry system.',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-rose-100 py-20 md:py-28">

        {/* Scattered paw print decorations — matches reference screenshot */}
        <PawPrintBg size={220} opacity={0.18} className="absolute -top-8 -left-8 text-rose-300 rotate-[-20deg]" />
        <PawPrintBg size={160} opacity={0.15} className="absolute top-10 right-10 text-rose-300 rotate-[15deg]" />
        <PawPrintBg size={130} opacity={0.18} className="absolute bottom-4 left-1/4 text-rose-300 rotate-[10deg]" />
        <PawPrintBg size={100} opacity={0.14} className="absolute bottom-8 right-1/3 text-rose-300 rotate-[-25deg]" />
        <PawPrintBg size={80}  opacity={0.12} className="absolute top-1/2 left-6 text-rose-300 rotate-[30deg]" />
        <PawPrintBg size={90}  opacity={0.13} className="absolute top-6 left-1/2 text-rose-300 rotate-[-10deg]" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Logo-style heading */}
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <PawPrintBg size={44} opacity={1} className="text-rose-500" />
            <span className="text-4xl md:text-5xl font-extrabold text-rose-500 tracking-tight">
              PetMarketplace
            </span>
          </div>

          <p className="max-w-md mx-auto text-lg text-gray-600 mb-2 leading-relaxed">
            Thousands of ads with furry and feathered pets, let&apos;s give love to your little friend
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 inline-grid grid-cols-2 gap-3 mx-auto">
            <Link href="/listings" className="block">
              <Button
                size="lg"
                className="w-full whitespace-nowrap bg-rose-500 text-white hover:bg-rose-600 shadow-md font-semibold"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/register" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full whitespace-nowrap border-rose-400 text-rose-500 hover:bg-rose-50"
              >
                Sign up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Discover / Species ── */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Discover</h2>
              <p className="text-sm text-gray-400 mt-0.5">Browse by pet type</p>
            </div>
            <Link
              href="/listings"
              className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              See all →
            </Link>
          </div>

          {/* Circular cards — scrollable on mobile */}
          <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide justify-start sm:justify-center">
            {SPECIES.map((s) => (
              <div key={s.name} className="shrink-0">
                <SpeciesCard
                  name={s.name}
                  emoji={s.emoji}
                  value={s.value}
                  bgColor={s.bgColor}
                  imagePath={s.imagePath}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Why <span className="text-rose-500">PetMarketplace</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 mb-4">
                  <f.icon size={22} className="text-rose-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="relative overflow-hidden bg-rose-100 py-14">
        <PawPrintBg size={150} opacity={0.15} className="absolute -bottom-6 -right-6 text-rose-300 rotate-[20deg]" />
        <PawPrintBg size={100} opacity={0.12} className="absolute top-2 left-8 text-rose-300 rotate-[-15deg]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to find your pet?</h2>
          <p className="text-gray-500 mb-7 text-lg">
            Join thousands of pet lovers across India
          </p>
          <div className="grid grid-cols-2 gap-3 inline-grid grid-cols-2 gap-3 mx-auto">
            <Link href="/listings" className="block">
              <Button
                size="lg"
                className="w-full whitespace-nowrap bg-rose-500 text-white hover:bg-rose-600 font-semibold shadow-md"
              >
                Browse Listings
              </Button>
            </Link>
            <Link href="/register" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full whitespace-nowrap border-rose-400 text-rose-500 hover:bg-rose-50"
              >
                List Your Pet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
