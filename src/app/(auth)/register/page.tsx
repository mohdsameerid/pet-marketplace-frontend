'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PawPrint, ShoppingBag, Store, Eye, EyeOff } from 'lucide-react';
import { PawPrintBg } from '@/components/ui/PawPrintBg';
import toast from 'react-hot-toast';

type Role = 'Buyer' | 'Seller';

const registerSchema = Yup.object({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least 1 number'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
  phoneNumber: Yup.string(),
  city: Yup.string(),
  role: Yup.mixed<Role>().oneOf(['Buyer', 'Seller']).required(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { document.title = 'Create Account — PetMarketplace'; }, []);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      city: '',
      role: 'Buyer' as Role,
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: values.role,
          ...(values.phoneNumber && { phoneNumber: values.phoneNumber }),
          ...(values.city && { city: values.city }),
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
        setSubmitting(false);
      }
    },
  });

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

        <form onSubmit={formik.handleSubmit} noValidate className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2">
            {roles.map(({ value, label, sub, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => formik.setFieldValue('role', value)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-sm font-medium transition-all ${
                  formik.values.role === value
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
            {...formik.getFieldProps('fullName')}
            error={(formik.touched.fullName || formik.submitCount > 0) && formik.errors.fullName ? formik.errors.fullName : undefined}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...formik.getFieldProps('email')}
            error={(formik.touched.email || formik.submitCount > 0) && formik.errors.email ? formik.errors.email : undefined}
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
                suppressHydrationWarning
                {...formik.getFieldProps('password')}
                className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:border-transparent ${
                  (formik.touched.password || formik.submitCount > 0) && formik.errors.password
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
            {(formik.touched.password || formik.submitCount > 0) && formik.errors.password
              ? <p className="text-xs text-red-500">{formik.errors.password}</p>
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
                suppressHydrationWarning
                {...formik.getFieldProps('confirmPassword')}
                className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:border-transparent ${
                  (formik.touched.confirmPassword || formik.submitCount > 0) && formik.errors.confirmPassword
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
            {(formik.touched.confirmPassword || formik.submitCount > 0) && formik.errors.confirmPassword && (
              <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
            )}
          </div>

          {/* Phone and City side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              {...formik.getFieldProps('phoneNumber')}
            />
            <Input
              label="City"
              placeholder="Mumbai"
              {...formik.getFieldProps('city')}
            />
          </div>

          <Button type="submit" isLoading={formik.isSubmitting} className="w-full">
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
