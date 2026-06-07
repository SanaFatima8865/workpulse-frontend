import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Camera, LogOut, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

import { useTitle } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/authSlice';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChangePasswordForm } from '@/features/auth';
import { useUpdateProfile, useLogout, useLogoutAll } from '@/features/auth';

// ─── Schema ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
  bio: z.string().max(500).optional(),
  jobTitle: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  timezone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  useTitle('Profile Settings');
  const user = useAppSelector(selectCurrentUser);
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const logoutAll = useLogoutAll();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      bio: user?.bio ?? '',
      jobTitle: user?.jobTitle ?? '',
      phone: user?.phone ?? '',
      timezone: user?.timezone ?? 'UTC',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
          Profile Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage your personal information and account preferences
        </p>
      </motion.div>

      {/* ── Avatar + Basic Info ──────────────────────────────────────────── */}
      <Card padding="lg">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <User size={18} className="text-brand-600" />
              Personal Information
            </span>
          }
          divider
        />

        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              name={`${user.firstName} ${user.lastName}`}
              src={user.avatar}
              size="2xl"
            />
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center shadow-brand text-white hover:bg-brand-700 transition-colors">
              <Camera size={13} />
            </button>
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-[var(--color-text)]">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary" size="md">
                {user.role}
              </Badge>
              <Badge variant={user.emailVerified ? 'success' : 'warning'} size="sm">
                {user.emailVerified ? 'Email verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="First name"
              error={errors.firstName?.message}
              disabled={updateProfile.isPending}
            />
            <Input
              {...register('lastName')}
              label="Last name"
              error={errors.lastName?.message}
              disabled={updateProfile.isPending}
            />
          </div>

          <Input
            {...register('jobTitle')}
            label="Job title"
            placeholder="Senior Engineer, Product Manager..."
            error={errors.jobTitle?.message}
            disabled={updateProfile.isPending}
          />

          <Input
            {...register('phone')}
            label="Phone number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            disabled={updateProfile.isPending}
          />

          <div>
            <label className="text-sm font-medium text-[var(--color-text)] leading-none block mb-1.5">
              Bio
            </label>
            <textarea
              {...register('bio')}
              placeholder="Tell your team a bit about yourself..."
              rows={3}
              disabled={updateProfile.isPending}
              className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150 resize-none"
            />
            {errors.bio && (
              <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={updateProfile.isPending}
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Change Password ──────────────────────────────────────────────── */}
      <ChangePasswordForm />

      {/* ── Sessions ─────────────────────────────────────────────────────── */}
      <Card padding="lg">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Monitor size={18} className="text-brand-600" />
              Sessions
            </span>
          }
          subtitle="Manage where you're signed in"
          divider
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<LogOut size={16} />}
            loading={logout.isPending}
            onClick={() => logout.mutate()}
          >
            Sign out this device
          </Button>
          <Button
            variant="danger"
            size="md"
            leftIcon={<LogOut size={16} />}
            loading={logoutAll.isPending}
            onClick={() => logoutAll.mutate()}
          >
            Sign out all devices
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
