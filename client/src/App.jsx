import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CreateTripPage from '@/pages/CreateTripPage';
import MyTripsPage from '@/pages/MyTripsPage';
import ItineraryBuilderPage from '@/pages/ItineraryBuilderPage';
import ItineraryViewPage from '@/pages/ItineraryViewPage';
import BudgetPage from '@/pages/BudgetPage';
import ChecklistPage from '@/pages/ChecklistPage';
import CitySearchPage from '@/pages/CitySearchPage';
import ActivitySearchPage from '@/pages/ActivitySearchPage';
import ProfilePage from '@/pages/ProfilePage';
import PublicTripPage from '@/pages/PublicTripPage';
import TripNotesPage from '@/pages/TripNotesPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

import { useState } from 'react';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="text-muted-foreground font-medium font-body">Loading Traveloop...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <main 
        className="flex-1 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col w-full"
        style={{ marginLeft: window.innerWidth >= 768 ? (collapsed ? '80px' : '260px') : '0px' }}
      >
        <Navbar setMobileOpen={setMobileOpen} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />
            <Route path="/trip/:id/public" element={<PublicTripPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/trips" element={<MyTripsPage />} />
              <Route path="/trips/new" element={<CreateTripPage />} />
              <Route path="/trips/:id" element={<ItineraryViewPage />} />
              <Route path="/trips/:id/edit" element={<ItineraryBuilderPage />} />
              <Route path="/trips/:id/budget" element={<BudgetPage />} />
              <Route path="/trips/:id/checklist" element={<ChecklistPage />} />
              <Route path="/trips/:id/notes" element={<TripNotesPage />} />
              <Route path="/search" element={<CitySearchPage />} />
              <Route path="/activities" element={<ActivitySearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
