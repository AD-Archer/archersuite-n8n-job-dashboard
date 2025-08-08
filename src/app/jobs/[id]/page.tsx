import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import JobDetailClient from '@/app/jobs/[id]/components/JobDetailClient';
import ArchiveJobButton from '@/components/ArchiveJobButton';

// Fetch job data directly from the database
async function getJob(id: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id }
    });
    return job;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Handle both Promise and direct params for compatibility
  const resolvedParams = await Promise.resolve(params);
  const jobData = await getJob(resolvedParams.id);
  if (!jobData) return notFound();

  // Convert Prisma model to Job type (handle null vs undefined)
  const job = {
    ...jobData,
    location: jobData.location ?? undefined,
    description: jobData.description ?? undefined,
    salary: jobData.salary ?? undefined,
    experienceLevel: jobData.experienceLevel ?? undefined,
    remote: jobData.remote ?? undefined,
    jobType: jobData.jobType ?? undefined,
    postedDate: jobData.postedDate ?? undefined,
    appliedDate: jobData.appliedDate?.toISOString() ?? undefined,
    notes: jobData.notes ?? undefined,
    score: jobData.score ?? undefined,
    coverLetter: jobData.coverLetter ?? undefined,
    createdAt: jobData.createdAt.toISOString(),
    updatedAt: jobData.updatedAt.toISOString(),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Job Board</span>
          </Link>
        </div>

        {/* Job Details */}
        <JobDetailClient job={job} />

        {/* Archive Button */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <ArchiveJobButton jobId={job.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
