// src/app/layout.tsx
'use client';

import { 
  Inter, 
  Lato, 
  Source_Code_Pro, 
  Poppins, 
  Roboto_Mono, 
  Playfair_Display, 
  Lora 
} from "next/font/google";
import "./globals.css";
import { LogIn, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";
import { app } from "@/lib/firebase";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const lato = Lato({ subsets: ["latin"], weight: ['400', '700'], variable: '--font-lato' });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], variable: '--font-source-code-pro' });
const poppins = Poppins({ subsets: ["latin"], weight: ['400', '600', '700'], variable: '--font-poppins' });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: '--font-roboto-mono' });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair-display' });
const lora = Lora({ subsets: ["latin"], variable: '--font-lora' });

function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const auth = getAuth(app);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="w-full bg-white/50 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-slate-800">
          Build That Thing
        </Link>
        <nav className="hidden md:flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600">
          <a href="https://buildthatinvoice.vercel.app/" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <span className="hidden sm:inline">Invoice Builder</span>
          </a>
          <a href="https://buildthatresume.vercel.app/" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <span className="hidden sm:inline">Resume Builder</span>
          </a>
          <a href="https://convertthatimage.vercel.app/" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <span className="hidden sm:inline">Image Converter</span>
          </a>
          <Link href="/" className="flex items-center gap-2 text-indigo-600 font-semibold">
            <span className="hidden sm:inline">Linkpage Builder</span>
          </Link>
          {user ? (
            <>
              <Link href="/edit/custom" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <User size={16} />
                <span className="hidden sm:inline">My Page</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      <div className={`grid md:hidden bg-white/80 backdrop-blur-lg overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out ${isMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="min-h-0">
            <a href="https://buildthatinvoice.vercel.app/" className="block py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 border-t border-slate-200/80">Invoice Builder</a>
            <a href="https://buildthatresume.vercel.app/" className="block py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 border-t border-slate-200/80">Resume Builder</a>
            <a href="https://convertthatimage.vercel.app/" className="block py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 border-t border-slate-200/80">Image Converter</a>
            <Link href="/" className="block py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 border-t border-slate-200/80">Linkpage Builder</Link>
            {user ? (
              <>
                <Link href="/edit/custom" className="block py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 border-t border-slate-200/80">My Page</Link>
                <button onClick={handleLogout} className="w-full text-left py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 border-t border-slate-200/80">Logout</button>
              </>
            ) : (
              <Link href="/login" className="block py-3 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 border-t border-slate-200/80">Login</Link>
            )}
          </div>
        </div>
    </header>
  );
}

// UPDATED: Replaced with your requested footer component
function SiteFooter() {
    return (
        <footer className="bg-white/50 border-t border-slate-200/80 mt-12 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    {/* Left Column: Branding and Links */}
                    <div className="text-center md:text-left">
                        <p className="text-base font-bold text-slate-800">Build That Thing</p>
                        <p className="mt-2 text-slate-500">
                            A suite of powerful, client-side tools to help you build and create.
                        </p>
                        <div className="flex justify-center md:justify-start gap-6 mt-4">
                            <a href="https://oliverrevelo.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-600 hover:text-indigo-600 transition-colors">Portfolio</a>
                            <a href="https://github.com/oancholarevelo" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-600 hover:text-indigo-600 transition-colors">GitHub</a>
                        </div>
                        <p className="mt-4 text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Oliver Revelo. All Rights Reserved.
                        </p>
                    </div>

                    {/* Right Column: Navigation Links */}
                    <div className="flex flex-col items-center md:items-end">
                        <h3 className="font-semibold text-slate-800">Navigate</h3>
                        <ul className="mt-2 space-y-1 text-center md:text-right">
                            <li><a href="https://buildthatthing.vercel.app/" className="text-slate-500 hover:text-indigo-600 transition-colors">Build That Thing</a></li>
                            <li><a href="https://buildthatinvoice.vercel.app/" className="text-slate-500 hover:text-indigo-600 transition-colors">Build That Invoice</a></li>
                            <li><a href="https://buildthatresume.vercel.app/" className="text-slate-500 hover:text-indigo-600 transition-colors">Build That Resume</a></li>
                            <li><Link href="/" className="text-slate-500 hover:text-indigo-600 transition-colors">Launch That Linkpage</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lato.variable} ${sourceCodePro.variable} ${poppins.variable} ${robotoMono.variable} ${playfairDisplay.variable} ${lora.variable} font-sans bg-slate-50`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-grow">
              {children}
            </main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}