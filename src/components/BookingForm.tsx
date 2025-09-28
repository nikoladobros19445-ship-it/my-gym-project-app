'use client';

import { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthContext } from '@/context/AuthContext';

export default function BookingForm() {
  const [date, setDate] = useState('');
  const { user } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selected = new Date(date);

    if (selected.getTime() < Date.now()) {
      setMessage('❗ Please choose a future date and time.');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        date: Timestamp.fromDate(selected),
        createdAt: Timestamp.now()
      });
      setDate('');
      setMessage('✅ Booking saved!');
    } catch (err) {
      console.error(err);
      setMessage('❗ Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="mt-8 w-full max-w-xl backdrop-blur-md bg-white/40
                 rounded-xl shadow-lg p-6 flex flex-col items-center"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Reserve a Gym Slot
      </h2>

      {/* Center the form controls inside the card */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <div className="flex flex-col">
          <label
            htmlFor="datetime"
            className="mb-1 text-sm font-medium text-gray-700 text-center"
          >
            Date &amp; Time
          </label>
          <input
            id="datetime"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={minDateTime}
            className="border border-gray-300 rounded px-4 py-2 text-black
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-semibold px-6 py-2 rounded-full shadow"
        >
          {saving ? 'Saving…' : 'Reserve'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
