import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '../lib/integrations';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function OAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');

        if (errorParam) {
          throw new Error('OAuth authorization was cancelled or failed');
        }

        if (!code || !state) {
          throw new Error('Invalid OAuth callback parameters');
        }

        await handleOAuthCallback(code, state);
        setStatus('success');

        setTimeout(() => {
          window.close();
        }, 2000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2">Connecting Integration</h2>
            <p className="text-white/50">Please wait while we complete the connection...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Successfully Connected!</h2>
            <p className="text-white/50">Your integration is now active. This window will close automatically.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
            <p className="text-white/50 mb-4">{error}</p>
            <button
              onClick={() => window.close()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
