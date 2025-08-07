"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArchiveJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/archive`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to archive job");
      router.push("/");
    } catch (e: any) {
      setError(e.message || "Failed to archive job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleArchive}
        disabled={loading}
        className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition mb-2 disabled:opacity-60"
      >
        {loading ? "Archiving..." : "Archive Job"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </>
  );
}
