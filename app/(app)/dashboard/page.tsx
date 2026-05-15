// app/(app)/dashboard/page.tsx
'use client';

import React from 'react';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="h-5 w-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return <StudentDashboard />;
}
