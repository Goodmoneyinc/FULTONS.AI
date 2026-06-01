import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Shield, LogOut, Upload as UploadIcon, FileText, PenTool, MessageSquare, Zap, Scale, Plug } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { ContractDrafting } from './ContractDrafting';
import { LegalAssistant } from './LegalAssistant';
import { WorkflowAutomation } from './WorkflowAutomation';
import { LegalResearch } from './LegalResearch';
import { DocumentVault } from './DocumentVault';
import { Integrations } from './Integrations';

interface DashboardProps {
  onLogout: () => void;
}

type ActiveTab = 'documents' | 'vault' | 'assistant' | 'workflows' | 'research' | 'drafting' | 'integrations';

interface NavigationTab {
  id: ActiveTab;
  label: string;
  icon: LucideIcon;
  textColor: string;
  activeClassName: string;
}

const navigationTabs: NavigationTab[] = [
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    textColor: 'text-blue-400',
    activeClassName: 'border-blue-500 bg-blue-500/10',
  },
  {
    id: 'vault',
    label: 'Vault',
    icon: Shield,
    textColor: 'text-emerald-400',
    activeClassName: 'border-emerald-500 bg-emerald-500/10',
  },
  {
    id: 'assistant',
    label: 'Assistant',
    icon: MessageSquare,
    textColor: 'text-purple-400',
    activeClassName: 'border-purple-500 bg-purple-500/10',
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Zap,
    textColor: 'text-amber-400',
    activeClassName: 'border-amber-500 bg-amber-500/10',
  },
  {
    id: 'research',
    label: 'Research',
    icon: Scale,
    textColor: 'text-red-400',
    activeClassName: 'border-red-500 bg-red-500/10',
  },
  {
    id: 'drafting',
    label: 'Drafting',
    icon: PenTool,
    textColor: 'text-cyan-400',
    activeClassName: 'border-cyan-500 bg-cyan-500/10',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    textColor: 'text-indigo-400',
    activeClassName: 'border-indigo-500 bg-indigo-500/10',
  },
];

export function Dashboard({ onLogout }: DashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('documents');
  const [documents, setDocuments] = useState<Array<{ id: string; filename: string }>>([]);

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('documents')
        .select('id, filename')
        .eq('owner_id', user.id)
        .eq('status', 'completed')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDocumentsChange = () => {
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-12">
            {navigationTabs.map(({ id, label, icon: Icon, textColor, activeClassName }) => {
              const isActive = activeTab === id;

              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`p-6 rounded-lg border-2 transition ${
                    isActive
                      ? activeClassName
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${isActive ? textColor : 'text-white/40'}`} />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wide">{label}</h3>
                </button>
              );
            })}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            {activeTab === 'documents' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <UploadIcon className="w-6 h-6" />
                    Upload New Document
                  </h2>
                  <DocumentUpload onUploadComplete={handleUploadComplete} />
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    Your Documents
                  </h2>
                  <DocumentList refreshTrigger={refreshTrigger} onDocumentsChange={handleDocumentsChange} />
                </div>

              </div>
            )}

            {activeTab === 'vault' && (
              <DocumentVault />
            )}

            {activeTab === 'assistant' && (
              <LegalAssistant onClose={() => setActiveTab('documents')} />
            )}

            {activeTab === 'workflows' && (
              <WorkflowAutomation documents={documents} />
            )}

            {activeTab === 'research' && (
              <LegalResearch />
            )}

            {activeTab === 'drafting' && (
              <ContractDrafting />
            )}

            {activeTab === 'integrations' && (
              <Integrations />
            )}
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
