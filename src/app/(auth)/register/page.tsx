'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PawPrint, ShoppingBag, Store, Eye, EyeOff } from 'lucide-react';
import { PawPrintBg } from '@/components/ui/PawPrintBg';
import toast from 'react-hot-toast';

type Role = 'Buyer' | 'Seller';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    city: '',
    role: 'Buyer' as Role,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { document.title = 'Create Account — PetMarketplace'; }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Password must contain at least 1 uppercase letter';
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain at least 1 number';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        ...(form.city && { city: form.city }),
      };
      const res = await authApi.register(payload);
      if (res.data.success) {
        toast.success('Account created! An admin will verify it before you can log in.');
        await new Promise((r) => setTimeout(r, 1500));
        router.push('/login');
      } else {
        toast.error(res.data.errors?.[0] ?? 'Registration failed');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ??
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { value: Role; label: string; sub: string; Icon: typeof ShoppingBag }[] = [
    { value: 'Buyer', label: 'Buy / Adopt', sub: 'Find a pet', Icon: ShoppingBag },
    { value: 'Seller', label: 'Sell / List', sub: 'List a pet', Icon: Store },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rose-100 px-4 py-12">
      {/* Paw print background decorations */}
      <PawPrintBg size={200} opacity={0.12} className="absolute -top-10 -left-10 text-rose-300 rotate-[-20deg]" />
      <PawPrintBg size={150} opacity={0.10} className="absolute top-10 right-8 text-rose-300 rotate-[25deg]" />
      <PawPrintBg size={120} opacity={0.10} className="absolute bottom-10 left-10 text-rose-300 rotate-[15deg]" />
      <PawPrintBg size={100} opacity={0.08} className="absolute bottom-20 right-16 text-rose-300 rotate-[-30deg]" />
      <PawPrintBg size={80}  opacity={0.08} className="absolute top-1/2 left-4 text-rose-300 rotate-[40deg]" />
      <PawPrintBg size={90}  opacity={0.08} className="absolute top-1/3 right-1/4 text-rose-300 rotate-[-15deg]" />

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
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">Join the PetMarketplace community</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2">
            {roles.map(({ value, label, sub, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-sm font-medium transition-all ${
                  form.role === value
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:text-rose-500'
                }`}
              >
                <Icon size={20} />
                <span className="font-semibold">{label}</span>
                <span className="text-xs font-normal opacity-70">{sub}</span>
              </button>
            ))}
          </div>

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            error={errors.fullName}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
          />

          {/* Password with show/hide */}
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
                className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:border-transparent ${
                  errors.password
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
            {errors.password
              ? <p className="text-xs text-red-500">{errors.password}</p>
              : <p className="text-xs text-gray-400">Min 6 chars, 1 uppercase, 1 number</p>
            }
          </div>

          {/* Confirm Password with show/hide */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-rose-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                suppressHydrationWarning
                className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:border-transparent ${
                  errors.confirmPassword
                    ? 'border-red-400 bg-red-50 focus:ring-red-300'
                    : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-rose-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* Phone and City side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
            <Input
              label="City"
              placeholder="Mumbai"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>

          <p className="text-xs text-center text-gray-400">
            Your account requires admin verification before login.
          </p>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-rose-500 hover:text-rose-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
