import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '../hooks/useAuth';

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export const LoginForm: React.FC = () => {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email */}
      <Input
        {...register('email')}
        label="Email address"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        leftIcon={<Mail size={15} />}
        error={errors.email?.message}
        disabled={loginMutation.isPending}
      />

      {/* Password */}
      <div>
        <Input
          {...register('password')}
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          leftIcon={<Lock size={15} />}
          error={errors.password?.message}
          disabled={loginMutation.isPending}
        />
        <div className="flex justify-end mt-2">
          <Link
            to="/auth/forgot-password"
            className="text-xs text-brand-600 hover:text-brand-700 hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <input
          {...register('rememberMe')}
          type="checkbox"
          className="w-4 h-4 rounded border-surface-border text-brand-600 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
          disabled={loginMutation.isPending}
        />
        <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">
          Stay signed in for 30 days
        </span>
      </label>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loginMutation.isPending || isSubmitting}
        rightIcon={!loginMutation.isPending ? <ArrowRight size={16} /> : undefined}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Register link */}
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="text-brand-600 hover:text-brand-700 font-semibold hover:underline"
        >
          Create one free
        </Link>
      </p>
    </form>
  );
};
