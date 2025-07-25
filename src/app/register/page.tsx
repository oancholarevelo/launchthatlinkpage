// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Link2 } from 'lucide-react';
import Link from 'next/link';

const auth = getAuth(app);

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    setError(null);
    setSuccess(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setSuccess("Verification email sent! Please check your inbox to verify your account before logging in.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-indigo-100 rounded-full">
            <Link2 size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mt-4">Create an Account</h1>
          <p className="text-slate-500">Create an account to start building your linkpage</p>
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
            placeholder="Password (at least 6 characters)"
            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button onClick={handleSignUp} className="w-full py-2.5 font-semibold rounded-lg bg-indigo-600 text-white">Create Account</button>
          <div className="text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-semibold text-indigo-600 hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </main>
  );
}