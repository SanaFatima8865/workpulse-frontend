import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Clock, X } from 'lucide-react';

import { Modal }    from '@/components/ui/Modal';
import { Input }    from '@/components/ui/Input';
import { Button }   from '@/components/ui/Button';
import { Badge }    from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { formatRelative } from '@/lib/utils';
import { useInviteMember, useWorkspaceInvitations, useRevokeInvitation } from '../hooks/useWorkspaces';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  role:  z.enum(['admin', 'member', 'guest']).default('member'),
});
type FormData = z.infer<typeof schema>;

interface InviteMemberModalProps {
  open:        boolean;
  onClose:     () => void;
  workspaceId: string;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  open, onClose, workspaceId,
}) => {
  const invite           = useInviteMember(workspaceId);
  const revoke           = useRevokeInvitation(workspaceId);
  const { data: pending = [], isLoading: pendingLoading } =
    useWorkspaceInvitations(workspaceId);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    invite.mutate(data, { onSuccess: () => reset() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite Team Members"
      description="Send invitation links to collaborate in this workspace."
      size="md"
    >
      {/* Invite form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6" noValidate>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              {...register('email')}
              placeholder="colleague@company.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              disabled={invite.isPending}
              autoFocus
            />
          </div>

          {/* Role select */}
          <select
            {...register('role')}
            disabled={invite.isPending}
            className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500 shrink-0"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={invite.isPending}
          leftIcon={<Mail size={15} />}
        >
          Send Invitation
        </Button>
      </form>

      {/* Pending invitations */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          Pending Invitations
        </h3>

        {pendingLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} height={44} />)}
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
            No pending invitations
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pending.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-secondary dark:bg-surface-dark-tertiary"
              >
                <Mail size={14} className="text-[var(--color-text-muted)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{inv.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={11} className="text-[var(--color-text-muted)]" />
                    <p className="text-2xs text-[var(--color-text-muted)]">
                      Expires {formatRelative(inv.expiresAt)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" size="sm">{inv.role}</Badge>
                <button
                  onClick={() => revoke.mutate(inv._id)}
                  disabled={revoke.isPending}
                  className="p-1 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  aria-label="Revoke invitation"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
