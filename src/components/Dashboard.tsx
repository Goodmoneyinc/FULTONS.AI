import { useState } from 'react';
import { Shield, LogOut, Upload as UploadIcon, FileText, PenTool } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { ContractDrafting } from './ContractDrafting';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed w-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/img_3153.jpeg" alt="Fultons Logo" className="w-16 h-16 rounded-full" />
            <div>
              <span className="text-2xl font-bold text-white tracking-tight block">FULTONS</span>
              <span className="text-xs text-white/50 uppercase tracking-widest">Document Management</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white/70 text-sm font-medium uppercase tracking-wide">
                Privacy Protected
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded font-semibold transition uppercase tracking-wide text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Legal Document Pipeline
            </h1>
            <p className="text-white/60 text-lg font-light">
              AI-powered contract review, drafting, and document analysis with DeepSeek R1
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/10 rounded">
                  <PenTool className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-bold uppercase tracking-wide text-sm">
                  AI Contract Drafting
                </h3>
              </div>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                Generate professional contracts with DeepSeek R1. Specify terms and get ready-to-use drafts.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 rounded">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-white font-bold uppercase tracking-wide text-sm">
                  Contract Review
                </h3>
              </div>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                Upload contracts for comprehensive AI analysis. Identify risks, obligations, and key terms.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold uppercase tracking-wide text-sm">
                  Privacy First
                </h3>
              </div>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                Your data is never used for AI training. Complete confidentiality guaranteed.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <UploadIcon className="w-6 h-6" />
              Upload New Document
            </h2>
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
            <ContractDrafting />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Your Documents
            </h2>
            <DocumentList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>

      <footer className="py-8 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-sm uppercase tracking-wider">
            © 2024 Fultons. All rights reserved. SOC2 Type II Certified.
          </p>
        </div>
      </footer>
    </div>
  );
}
