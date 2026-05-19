// app/(auth)/onboarding/page.tsx
import Onboarding from '@/components/auth/Onboarding';

export const dynamic = 'force-static';

export default function OnboardingPage() {
  return <Onboarding />;
}
