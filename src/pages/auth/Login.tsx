import React from 'react';

import { useTitle } from '@/hooks';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

const LoginPage: React.FC = () => {
  useTitle('Sign In');

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your WorkPulse account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
