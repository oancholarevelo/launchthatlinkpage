// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Link2 } from 'lucide-react';
import Link from 'next/link';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to home after login
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-indigo-100 rounded-full">
            <Link2 size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mt-4">Welcome Back</h1>
          <p className="text-slate-500">Sign in to manage your page</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={handleLogin} className="w-full py-2.5 font-semibold rounded-lg bg-indigo-600 text-white">Login</button>
          <div className="text-center text-sm text-slate-500">
            Don&apos;t have an account? <Link href="/register" className="font-semibold text-indigo-600 hover:underline">Sign up</Link>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-slate-500">OR</span></div>
          </div>
          <button onClick={handleGoogleSignIn} className="w-full py-2.5 font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.508,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </main>
  );
}