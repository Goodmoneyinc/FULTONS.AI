import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  };

  const handleLogout = () => {
    setSession(null);
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (session) {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (showAuth) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

export default App;
