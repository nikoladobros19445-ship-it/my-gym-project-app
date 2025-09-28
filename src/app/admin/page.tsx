'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthContext } from '@/context/AuthContext';

interface BookingWithUser {
  id: string;
  email: string;
  date: Date;
  userId: string;
}

export default function AdminPage() {
  const { user, role, loading } = useAuthContext();
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);

  if (loading) return <div>Loading…</div>;
  if (!user || role !== 'admin') redirect('/login');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);

      // 1️⃣ Get all users and map their uid -> email
      const usersSnap = await getDocs(collection(db, 'users'));
      const userMap: Record<string, string> = {};
      usersSnap.forEach(d => {
        const data = d.data() as { email?: string };
        if (data.email) userMap[d.id] = data.email!;
      });

      // 2️⃣ Get all bookings ordered by date
      const q = query(collection(db, 'bookings'), orderBy('date'));
      const bookingsSnap = await getDocs(q);

      const all: BookingWithUser[] = bookingsSnap.docs.map(docSnap => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          userId: data.userId,
          email: userMap[data.userId] || '(unknown user)',
          date: new Date(data.date.seconds * 1000)
        };
      });

      setBookings(all);
      setLoadingBookings(false);
    };

    fetchBookings();
  }, []);

  const cancelBooking = async (id: string) => {
    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'bookings', id));
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('❗ Could not cancel booking, please try again.');
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h2>

      {loadingBookings ? (
        <div className="text-center">Loading all bookings…</div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-600 italic">No bookings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white/80 backdrop-blur-sm rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">User Email</th>
                <th className="py-2 px-4 border-b text-left">Booking Date</th>
                <th className="py-2 px-4 border-b text-left">Booking Time</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const isConfirming = confirmId === b.id;
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{b.email}</td>
                    <td className="py-2 px-4 border-b">
                      {b.date.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {b.date.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {isConfirming ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => cancelBooking(b.id)}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50
                                       text-white font-semibold px-3 py-1 rounded-full shadow"
                          >
                            {deleting ? 'Deleting…' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-900
                                       font-semibold px-3 py-1 rounded-full shadow"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(b.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold
                                     px-3 py-1 rounded-full shadow"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
