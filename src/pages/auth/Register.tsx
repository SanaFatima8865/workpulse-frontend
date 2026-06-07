import React from 'react';

import { useTitle } from '@/hooks';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
  useTitle('Create Account');

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free WorkPulse workspace today — no credit card required"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
