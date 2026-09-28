'use client';

import ErrorContent from '@/components/shared/ErrorContent';

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent {...props} />;
}
