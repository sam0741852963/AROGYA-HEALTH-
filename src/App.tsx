/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { UserProfile, Doctor, Disease } from './types';
import { SEED_DOCTORS, SEED_DISEASES } from './seedData';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Calendar, Clipboard, Heart, Home as HomeIcon, LogOut, Menu, Search, User, X, Stethoscope, ChevronRight, UserPlus, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';

// Pages
import HomePage from './pages/Home';
import DoctorListing from './pages/DoctorListing';
import DiseaseDetail from './pages/DiseaseDetail';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/Auth';
import AIAgent from './components/AIAgent';

const AuthContext = createContext<{
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seed = async (currentUser: UserProfile) => {
      if (currentUser.role !== 'admin') return;

      try {
        const doctorsSnap = await getDoc(doc(db, 'metadata', 'seeded_v1'));
        if (!doctorsSnap.exists()) {
          const doctorsCol = collection(db, 'doctors');
          const diseasesCol = collection(db, 'diseases');
          
          for (const docData of SEED_DOCTORS) {
            await addDoc(doctorsCol, { ...docData, createdAt: new Date().toISOString() });
          }
          for (const disData of SEED_DISEASES) {
            await addDoc(diseasesCol, { ...disData, createdAt: new Date().toISOString() });
          }
          await setDoc(doc(db, 'metadata', 'seeded_v1'), { date: new Date().toISOString() });
        }
      } catch (error) {
        console.error("Seeding error:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let currentUser: UserProfile;
        
        if (userDoc.exists()) {
          currentUser = userDoc.data() as UserProfile;
        } else {
          currentUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Guest',
            photoURL: firebaseUser.photoURL || '',
            role: firebaseUser.email === 'sameerkesharwani2006@gmail.com' ? 'admin' : 'patient',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), currentUser);
        }
        setUser(currentUser);
        // Trigger seed check after auth is ready
        seed(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <Router>
        <div className="min-h-screen flex flex-col pt-16">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/doctors" element={<DoctorListing />} />
                <Route path="/disease/:id" element={<DiseaseDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auth" element={<AuthPage />} />
              </Routes>
            </AnimatePresence>
          </main>
          <AIAgent />
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function Navbar() {
  const { user, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Doctors', href: '/doctors', icon: Stethoscope },
    { name: 'Diseases', href: '/#diseases', icon: Activity },
    { name: 'Services', href: '/#services', icon: Heart },
    { name: 'Dashboard', href: '/dashboard', icon: Clipboard, private: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-accent p-2 rounded-xl text-white transform group-hover:rotate-12 transition-transform">
            <Activity size={24} />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">Aarogya <span className="text-accent underline decoration-accent/30 underline-offset-4">Care</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            (!link.private || user) && (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-slate-600 hover:text-accent transition-colors flex items-center gap-1.5"
              >
                <link.icon size={16} />
                {link.name}
              </Link>
            )
          ))}
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                <img src={user.photoURL} className="w-8 h-8 rounded-full border border-accent/20" alt="" referrerPolicy="no-referrer" />
                <span className="text-sm font-semibold">{user.displayName.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-accent text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center gap-2"
            >
              <User size={18} />
              Login
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-600">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-white border-b shadow-xl md:hidden p-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              (!link.private || user) && (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <link.icon size={20} className="text-accent" />
                  <span className="font-medium text-slate-700">{link.name}</span>
                </Link>
              )
            ))}
            {!user && (
              <button
                onClick={() => { login(); setIsMenuOpen(false); }}
                className="w-full bg-accent text-white p-3 rounded-lg font-bold"
              >
                Login with Google
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 text-white mb-6">
            <Activity className="text-accent" size={24} />
            <span className="font-serif text-xl font-bold">Aarogya Care</span>
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Providing accessible, high-quality healthcare services throughout India. Empowering patients with technology for a healthier tomorrow.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-colors cursor-pointer">
              <Activity size={18} />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-colors cursor-pointer">
              <Heart size={18} />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Explore</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/doctors" className="hover:text-accent">Our Specialist Doctors</Link></li>
            <li><a href="#diseases" className="hover:text-accent">Health Library</a></li>
            <li><a href="#services" className="hover:text-accent">Hospital Services</a></li>
            <li><Link to="/dashboard" className="hover:text-accent">Patient Portal</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Activity size={16} className="text-accent" />
              <span>123 Medical Lane, MG Road, Bangalore, KA</span>
            </li>
            <li className="flex items-center gap-3">
              <Heart size={16} className="text-accent" />
              <span>+91 80 1234 5678</span>
            </li>
            <li className="flex items-center gap-3">
              <Activity size={16} className="text-accent" />
              <span>support@aarogyacare.in</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Newsletter</h4>
          <p className="text-xs mb-4">Stay updated with our latest health tips and hospital announcements.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Your email" className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-accent" />
            <button className="bg-accent text-white p-2 rounded-lg hover:bg-accent/80 transition-colors">
              <Activity size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} Aarogya Healthcare Systems. All rights reserved.</p>
      </div>
    </footer>
  );
}

