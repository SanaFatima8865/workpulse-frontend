import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader } from '@/components/ui/Card';
import { useChangePassword } from '../hooks/useAuth';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter')
      .regex(/[a-z]/, 'One lowercase letter')
      .regex(/[0-9]/, 'One number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must differ from current',
    path: ['newPassword'],
  });

type FormData = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

export const ChangePasswordForm: React.FC = () => {
  const mutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data, { onSuccess: () => reset() });
  };

  return (
    <Card padding="lg">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-600" />
            Change Password
          </span>
        }
        subtitle="You'll be signed out of all devices after changing your password"
        divider
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4" noValidate>
        <Input
          {...register('currentPassword')}
          label="Current password"
          type="password"
          placeholder="Enter current password"
          leftIcon={<Lock size={15} />}
          error={errors.currentPassword?.message}
          disabled={mutation.isPending}
        />
        <Input
          {...register('newPassword')}
          label="New password"
          type="password"
          placeholder="Create new password"
          leftIcon={<Lock size={15} />}
          error={errors.newPassword?.message}
          disabled={mutation.isPending}
        />
        <Input
          {...register('confirmPassword')}
          label="Confirm new password"
          type="password"
          placeholder="Repeat new password"
          leftIcon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
          disabled={mutation.isPending}
        />

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={mutation.isPending}
          >
            Change Password
          </Button>
        </div>
      </form>
    </Card>
  );
};
