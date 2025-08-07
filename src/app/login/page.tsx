"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/has-users")
      .then((res) => res.json())
      .then((data) => setHasUsers(data.hasUsers))
      .catch(() => setHasUsers(true)); // fallback to login if error
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    setLoading(false);
    if (res.ok) {
      setHasUsers(true);
      setError("");
      alert("Admin user created! Please log in.");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {hasUsers === null ? (
        <div className="text-white text-lg">Loading...</div>
      ) : hasUsers ? (
        <form
          onSubmit={handleLogin}
          className="bg-white/80 rounded-2xl p-8 shadow-xl flex flex-col space-y-6 w-full max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-center">Sign In</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-3 font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleCreateUser}
          className="bg-white/80 rounded-2xl p-8 shadow-xl flex flex-col space-y-6 w-full max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-center">Create Admin User</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Admin User"}
          </button>
        </form>
      )}
    </div>
  );
}
