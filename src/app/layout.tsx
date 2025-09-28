import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthContextProvider } from '@/context/AuthContext'
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Gym Booking',
  description: 'Reserve your gym slots easily',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/gym-hero.jpg')" }}
      >
        <div className="backdrop-blur-sm bg-black/30 min-h-screen">
          <AuthContextProvider>
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-10">
              {children}
              <Analytics />
            </main>
          </AuthContextProvider>
        </div>
      </body>
    </html>
  )
}
