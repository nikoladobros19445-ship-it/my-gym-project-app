'use client';

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthContext } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

interface Booking {
  id: string;
  userId: string;
  date: { seconds: number; nanoseconds: number };
  createdAt: any;
}

export default function BookingList() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'bookings'), orderBy('date'));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(b => b.userId === user.uid);
      setBookings(all as Booking[]);
    });
    return () => unsub();
  }, [user]);

  const cancelBooking = async (id: string) => {
    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('❗ Could not cancel booking, please try again.');
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-10 w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Your Upcoming Bookings
      </h2>

      {bookings.length === 0 ? (
        <p className="text-gray-600 italic text-center">
          You have no upcoming bookings.
        </p>
      ) : (
        <ul className="space-y-4">
          {bookings.map(b => {
            const dateObj = new Date(b.date.seconds * 1000);
            const isConfirming = confirmId === b.id;

            return (
              <li
                key={b.id}
                className="bg-white/80 backdrop-blur-sm border border-gray-200
                           rounded-lg shadow p-4 flex flex-col sm:flex-row
                           sm:items-center sm:justify-between"
              >
                <div className="text-center sm:text-left mb-3 sm:mb-0">
                  <div className="text-lg font-semibold text-gray-900">
                    {dateObj.toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-gray-700">
                    {dateObj.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Cancel / Confirm controls */}
                {isConfirming ? (
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <button
                      onClick={() => cancelBooking(b.id)}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50
                                 text-white font-semibold px-4 py-1 rounded-full shadow"
                    >
                      {deleting ? 'Deleting…' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-900
                                 font-semibold px-4 py-1 rounded-full shadow"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(b.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold
                               px-4 py-1 rounded-full shadow"
                  >
                    Cancel
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
