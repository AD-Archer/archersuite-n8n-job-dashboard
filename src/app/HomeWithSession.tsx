"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import JobBoard from "@/components/JobBoard";

export default function HomeWithSession() {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) {
    router.push('/login');
    return null;
  }
  return <JobBoard />;
}
