import { useState, useEffect } from 'react';
import { Shield, LogOut, Upload as UploadIcon, FileText, PenTool, MessageSquare, Zap, Scale, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { ContractDrafting } from './ContractDrafting';
import { LegalAssistant } from './LegalAssistant';
import { WorkflowAutomation } from './WorkflowAutomation';
import { LegalResearch } from './LegalResearch';
import { DocumentVault } from './DocumentVault';

interface DashboardProps {
  onLogout: () => void;
}

type ActiveTab = 'documents' | 'assistant' | 'workflows' | 'research' | 'drafting';

export function Dashboard({ onLogout }: DashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('documents');
  const [documents, setDocuments] = useState<Array<{ id: string; filename: string }>>([]);
  const [showGeneralAssistant, setShowGeneralAssistant] = useState(false);

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

          <div className="grid lg:grid-cols-5 gap-4 mb-12">
            <button
              onClick={() => setActiveTab('documents')}
              className={`p-6 rounded-lg border-2 transition ${
                activeTab === 'documents'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <FileText className={`w-8 h-8 mx-auto mb-3 ${activeTab === 'documents' ? 'text-blue-400' : 'text-white/40'}`} />
              <h3 className="text-white font-bold text-sm uppercase tracking-wide">Documents</h3>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`p-6 rounded-lg border-2 transition ${
                activeTab === 'assistant'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <MessageSquare className={`w-8 h-8 mx-auto mb-3 ${activeTab === 'assistant' ? 'text-green-400' : 'text-white/40'}`} />
              <h3 className="text-white font-bold text-sm uppercase tracking-wide">Assistant</h3>
            </button>

            <button
              onClick={() => setActiveTab('workflows')}
              className={`p-6 rounded-lg border-2 transition ${
                activeTab === 'workflows'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <Zap className={`w-8 h-8 mx-auto mb-3 ${activeTab === 'workflows' ? 'text-purple-400' : 'text-white/40'}`} />
              <h3 className="text-white font-bold text-sm uppercase tracking-wide">Workflows</h3>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              className={`p-6 rounded-lg border-2 transition ${
                activeTab === 'research'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <Scale className={`w-8 h-8 mx-auto mb-3 ${activeTab === 'research' ? 'text-amber-400' : 'text-white/40'}`} />
              <h3 className="text-white font-bold text-sm uppercase tracking-wide">Research</h3>
            </button>

            <button
              onClick={() => setActiveTab('drafting')}
              className={`p-6 rounded-lg border-2 transition ${
                activeTab === 'drafting'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <PenTool className={`w-8 h-8 mx-auto mb-3 ${activeTab === 'drafting' ? 'text-cyan-400' : 'text-white/40'}`} />
              <h3 className="text-white font-bold text-sm uppercase tracking-wide">Drafting</h3>
            </button>
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

                <div className="border-t border-white/10 pt-8">
                  <DocumentVault />
                </div>
              </div>
            )}

            {activeTab === 'assistant' && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Legal AI Assistant</h2>
                <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                  Ask questions about your documents or get general legal guidance with verified citations
                </p>
                <button
                  onClick={() => setShowGeneralAssistant(true)}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
                >
                  Start Conversation
                </button>
              </div>
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

      {showGeneralAssistant && (
        <LegalAssistant
          onClose={() => setShowGeneralAssistant(false)}
        />
      )}
    </div>
  );
}
