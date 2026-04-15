'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PawPrint, Eye, EyeOff } from 'lucide-react';
import { PawPrintBg } from '@/components/ui/PawPrintBg';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { document.title = 'Sign In — PetMarketplace'; }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors = validate();
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const res = await authApi.login(form);
      if (res.data.success) {
        login(res.data.data);
        toast.success(`Welcome back, ${res.data.data.fullName}!`);
        if (res.data.data.role === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(res.data.errors?.[0] ?? 'Login failed');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ??
        'Invalid credentials or unverified account';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rose-100 px-4">
      {/* Paw print background decorations */}
      <PawPrintBg size={200} opacity={0.12} className="absolute -top-10 -left-10 text-rose-300 rotate-[-20deg]" />
      <PawPrintBg size={150} opacity={0.10} className="absolute top-10 right-8 text-rose-300 rotate-[25deg]" />
      <PawPrintBg size={120} opacity={0.10} className="absolute bottom-10 left-10 text-rose-300 rotate-[15deg]" />
      <PawPrintBg size={100} opacity={0.08} className="absolute bottom-20 right-16 text-rose-300 rotate-[-30deg]" />
      <PawPrintBg size={80} opacity={0.08} className="absolute top-1/2 left-4 text-rose-300 rotate-[40deg]" />
      <PawPrintBg size={90} opacity={0.08} className="absolute top-1/3 right-1/4 text-rose-300 rotate-[-15deg]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 shadow-sm">
              <PawPrint size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Pet<span className="text-rose-500">Marketplace</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
          />

          {/* Password with show/hide toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Password <span className="text-rose-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                suppressHydrationWarning
                className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:border-transparent ${errors.password
                  ? 'border-red-400 bg-red-50 focus:ring-red-300'
                  : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-rose-400'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Log in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-rose-500 hover:text-rose-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
