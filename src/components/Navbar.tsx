'use client';

import { useAuthContext } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuthContext();

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
        {/* App name / logo */}
        <h1 className="text-xl font-bold tracking-wide">
          Gym Booking
        </h1>

        <nav className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm sm:text-base">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
