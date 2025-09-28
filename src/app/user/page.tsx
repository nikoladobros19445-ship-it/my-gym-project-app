'use client';
import { useAuthContext } from '@/context/AuthContext';
import BookingForm from '@/components/BookingForm';
import BookingList from '@/components/BookingList';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { user, role, loading } = useAuthContext();
  if (loading) return <div>Loading…</div>;
  if (!user || role !== 'admin') redirect('/login');

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <BookingForm />
      <BookingList />
    </>
  );
}
