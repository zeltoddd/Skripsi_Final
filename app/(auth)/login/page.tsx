// app/(auth)/login/page.tsx
import Login from '@/components/auth/Login';

export const dynamic = 'force-static';

export default function LoginPage() {
  return <Login />;
}
