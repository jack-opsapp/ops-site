/**
 * Login Page — /login
 *
 * Server component wrapper. Renders LoginForm client component.
 * Supports ?mode=signup to start in signup mode.
 * Supports ?next=/path to redirect after auth.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your OPS account or create a new one.',
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
