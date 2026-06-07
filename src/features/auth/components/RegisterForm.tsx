import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Mail, Lock, User, Building2, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/cn';
import { useRegister } from '../hooks/useAuth';

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(1, 'First name is required')
      .max(50, 'Too long'),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .min(1, 'Last name is required')
      .max(50, 'Too long'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please enter a valid email address'),
    workspaceName: z
      .string()
      .min(2, 'Workspace name must be at least 2 characters')
      .max(60, 'Too long')
      .optional()
      .or(z.literal('')),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter required')
      .regex(/[a-z]/, 'One lowercase letter required')
      .regex(/[0-9]/, 'One number required'),
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password Requirements ────────────────────────────────────────────────────

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

const getPasswordStrength = (password: string): number => {
  const passed = requirements.filter((r) => r.test(password)).length;
  return (passed / requirements.length) * 100;
};

const getStrengthLabel = (strength: number) => {
  if (strength === 0) return { label: '', color: 'brand' as const };
  if (strength <= 25) return { label: 'Weak', color: 'danger' as const };
  if (strength <= 50) return { label: 'Fair', color: 'warning' as const };
  if (strength <= 75) return { label: 'Good', color: 'brand' as const };
  return { label: 'Strong', color: 'success' as const };
};

// ─── Component ────────────────────────────────────────────────────────────────

export const RegisterForm: React.FC = () => {
  const registerMutation = useRegister();
  const [password, setPassword] = React.useState('');
  const [showRequirements, setShowRequirements] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      workspaceName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const strength = getPasswordStrength(password);
  const strengthInfo = getStrengthLabel(strength);

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      workspaceName: data.workspaceName || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          {...register('firstName')}
          label="First name"
          placeholder="Alice"
          autoComplete="given-name"
          leftIcon={<User size={15} />}
          error={errors.firstName?.message}
          disabled={registerMutation.isPending}
        />
        <Input
          {...register('lastName')}
          label="Last name"
          placeholder="Chen"
          autoComplete="family-name"
          error={errors.lastName?.message}
          disabled={registerMutation.isPending}
        />
      </div>

      {/* Email */}
      <Input
        {...register('email')}
        label="Work email"
        type="email"
        placeholder="alice@company.com"
        autoComplete="email"
        leftIcon={<Mail size={15} />}
        error={errors.email?.message}
        disabled={registerMutation.isPending}
      />

      {/* Workspace name */}
      <Input
        {...register('workspaceName')}
        label="Workspace name"
        placeholder="Acme Corp (optional)"
        leftIcon={<Building2 size={15} />}
        hint="You can create or join workspaces later"
        error={errors.workspaceName?.message}
        disabled={registerMutation.isPending}
      />

      {/* Password */}
      <div>
        <Input
          {...register('password', {
            onChange: (e) => setPassword(e.target.value),
          })}
          label="Password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          leftIcon={<Lock size={15} />}
          error={errors.password?.message}
          disabled={registerMutation.isPending}
          onFocus={() => setShowRequirements(true)}
        />

        {/* Strength meter */}
        <AnimatePresence>
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2">
                <Progress value={strength} size="xs" color={strengthInfo.color} className="flex-1" />
                {strengthInfo.label && (
                  <span
                    className={cn(
                      'text-2xs font-semibold shrink-0',
                      strength <= 25
                        ? 'text-red-500'
                        : strength <= 50
                          ? 'text-amber-500'
                          : strength <= 75
                            ? 'text-brand-500'
                            : 'text-emerald-600'
                    )}
                  >
                    {strengthInfo.label}
                  </span>
                )}
              </div>

              {showRequirements && (
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {requirements.map((req) => {
                    const passed = req.test(password);
                    return (
                      <li key={req.label} className="flex items-center gap-1.5">
                        {passed ? (
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle size={12} className="text-gray-300 shrink-0" />
                        )}
                        <span
                          className={cn(
                            'text-2xs',
                            passed ? 'text-emerald-600' : 'text-[var(--color-text-muted)]'
                          )}
                        >
                          {req.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm password */}
      <Input
        {...register('confirmPassword')}
        label="Confirm password"
        type="password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        leftIcon={<Lock size={15} />}
        error={errors.confirmPassword?.message}
        disabled={registerMutation.isPending}
      />

      {/* Terms notice */}
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
        By creating an account you agree to our{' '}
        <a href="#" className="text-brand-600 hover:underline">Terms of Service</a>{' '}
        and{' '}
        <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>.
      </p>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={registerMutation.isPending || isSubmitting}
        rightIcon={!registerMutation.isPending ? <ArrowRight size={16} /> : undefined}
      >
        {registerMutation.isPending ? 'Creating account...' : 'Create Free Account'}
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="text-brand-600 hover:text-brand-700 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};
