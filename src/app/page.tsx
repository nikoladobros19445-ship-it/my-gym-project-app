'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import BookingForm from '@/components/BookingForm';
import BookingList from '@/components/BookingList';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const { user, loading, role } = useAuthContext();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  

  if (loading) return <div className="p-6">Loading…</div>;

  if (user && role === 'admin') {
    // ✅ send admin users to the admin dashboard
    redirect('/admin');
  }


  // ---------- Dashboard if logged in ----------
  if (user) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-stone-200/80 p-6">
  <BookingForm />
  <BookingList />
</div>
    );
  }

  // ---------- Auth forms if not logged in ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (tab === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // optional: store default role in Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
          email,
          role: 'user',
          createdAt: new Date()
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Gym Booking</h1>

      <div className="bg-white rounded shadow w-full max-w-md p-6 text-black">
        {/* Tabs */}
        <div className="flex mb-4">
          <button
            onClick={() => setTab('signin')}
            className={`flex-1 py-2 font-semibold border-b-2 ${
              tab === 'signin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 font-semibold border-b-2 ${
              tab === 'register'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded"
          >
            {tab === 'signin' ? 'Sign In' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
