'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PawPrint } from 'lucide-react';
import toast from 'react-hot-toast';

type Role = 'Buyer' | 'Seller';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    role: 'Buyer' as Role,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white px-4 py-12">
      <div className="w-full max-w-sm">
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
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {(['Buyer', 'Seller'] as Role[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.role === role
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {role === 'Buyer' ? '🐾 Buyer' : '🏪 Seller'}
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
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            helperText="At least 6 characters"
            required
          />
          <Input
            label="Phone Number"
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
