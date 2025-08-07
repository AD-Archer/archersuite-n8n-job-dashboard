'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import JobBoard from '@/components/JobBoard'

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]"></div>
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header - Mobile Optimized */}
          <div className="mb-6 sm:mb-8 animate-slide-up">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2 sm:mb-3">
                Job Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
                Manage your job search configurations and view results from your automation
              </p>
            </div>
          </div>
          
          <JobBoard />
        </div>
      </div>
    </div>
  )
}
