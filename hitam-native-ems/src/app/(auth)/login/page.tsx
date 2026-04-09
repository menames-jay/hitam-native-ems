"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "An authentication error occurred.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-lg">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400">Log in to access your HITAM EMS dashboard</p>
        </div>
        
        <div className="bg-white dark:bg-[#1e2d1e]/60 shadow-[0_25px_50px_-12px_rgba(40,111,41,0.12)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-primary/5 dark:border-white/10 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem]">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">HITAM Email ID</label>
                    <div className="relative">
                        <input 
                            type="email"
                            className="block w-full px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-slate-400 text-slate-900 bg-white dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500" 
                            placeholder="e.g. 21x41a0501@hitam.org" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
                        <Link href="#" className="text-xs font-medium text-primary hover:underline underline-offset-4">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <input 
                            type="password"
                            className="block w-full px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-slate-400 text-slate-900 bg-white dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500" 
                            placeholder="••••••••" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-[#225c23] disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group mt-8"
                >
                    {loading ? "Authenticating..." : "Login"}
                    {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </button>
            </form>
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                    New here? 
                    <Link href="/signup" className="text-primary font-bold hover:underline underline-offset-4 ml-1">Create Account</Link>
                </p>
            </div>
        </div>
        <div className="mt-12 flex items-center justify-center gap-6 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-widest">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
        </div>
    </div>
  );
}
