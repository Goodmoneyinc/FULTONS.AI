import { useState, useEffect } from 'react';
import { FileText, Loader2, Search, Filter, Table, FolderSync, History } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeDocument } from '../lib/api';
import { ReviewTable } from './ReviewTable';

interface Document {
  id: string;
  name: string;
  file_path: string;
  upload_date: string;
  status: string;
  file_size: number;
}

interface DocumentRow {
  id: string;
  name?: string | null;
  filename?: string | null;
  file_path?: string | null;
  upload_date?: string | null;
  created_at?: string | null;
  status?: string | null;
  file_size?: number | null;
}

interface VaultTask {
  type: 'summarize' | 'extract';
  label: string;
  description: string;
  icon: string;
}

const vaultTasks: VaultTask[] = [
  {
    type: 'summarize',
    label: 'Summarize Document',
    description: 'Get an executive summary with key terms and parties',
    icon: '📄',
  },
  {
    type: 'extract',
    label: 'Extract Data',
    description: 'Extract parties, dates, amounts into structured JSON',
    icon: '🔍',
  },
];

const normalizeDocument = (doc: DocumentRow): Document => ({
  id: doc.id,
  name: doc.name || doc.filename || 'Untitled document',
  file_path: doc.file_path || '',
  upload_date: doc.upload_date || doc.created_at || new Date(0).toISOString(),
  status: doc.status || 'unknown',
  file_size: doc.file_size ?? 0,
});

const formatDate = (dateValue: string) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString();
};

const formatFileSize = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

export function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [taskResult, setTaskResult] = useState<string>('');
  const [extractedData, setExtractedData] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'analysis' | 'review'>('analysis');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDocuments([]);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'completed')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(((data || []) as DocumentRow[]).map(normalizeDocument));
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeExtraction = async (docId: string) => {
    const { data, error } = await supabase
      .from('document_contents')
      .select('content_text')
      .eq('document_id', docId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const contentText = data?.content_text?.trim() || 'No extracted content is available for this document.';
    setExtractedData(contentText);
    return contentText;
  };

  const runTask = async (task: VaultTask) => {
    if (!selectedDoc) return;

    setProcessing(true);
    setTaskResult('');
    setExtractedData('');

    try {
      if (task.type === 'extract') {
        const contentText = await executeExtraction(selectedDoc.id);
        setTaskResult(contentText);
        return;
      }

      const result = await analyzeDocument(selectedDoc.id, task.type);
      const modelInfo = result.documentStats.isLargeDocument
        ? '✨ Analyzed with Gemini 1.5 Flash (optimized for large documents)'
        : `✨ Analyzed with ${result.model}`;

      setTaskResult(`${modelInfo}\n\n${result.content}`);
    } catch (err) {
      console.error('Error running task:', err);
      setTaskResult('Failed to process document. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Document Vault
            </h2>
            <p className="text-white/50 text-sm">
              Unified workspace for matters, documents, and research with version control
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
              <FolderSync className="w-4 h-4 text-white/40" />
              <span className="text-white/60 text-sm">Sync with DMS</span>
            </div>
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-white/60 text-sm">{documents.length}/100 files</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('analysis')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeView === 'analysis'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Document Analysis
          </button>
          <button
            onClick={() => setActiveView('review')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              activeView === 'review'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Table className="w-4 h-4" />
            Multi-Document Matrix
          </button>
        </div>
      </div>

      {activeView === 'review' ? (
        <ReviewTable documents={documents} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                />
                <Filter className="w-5 h-5 text-white/40" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                Your Documents ({filteredDocs.length})
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No documents found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredDocs.map((doc) => {
                    const isActive = selectedDoc?.id === doc.id;

                    return (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setTaskResult('');
                          setExtractedData('');
                        }}
                        className={`w-full border rounded-lg p-4 text-left transition hover:bg-white/10 ${
                          isActive
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{doc.name}</p>
                            <p className="text-white/40 text-xs mt-1">
                              {formatDate(doc.upload_date)} • {formatFileSize(doc.file_size)}
                            </p>
                          </div>
                          <FileText className="w-5 h-5 text-white/40 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {!selectedDoc ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">Select a document to begin</p>
              </div>
            ) : (
              <>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-1">{selectedDoc.name}</h3>
                  <p className="text-white/40 text-xs">
                    Choose a task below to analyze this document
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                    Analysis Tasks
                  </h3>
                  {vaultTasks.map((task) => (
                    <button
                      key={task.type}
                      onClick={() => runTask(task)}
                      disabled={processing}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-left transition hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{task.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{task.label}</p>
                          <p className="text-white/50 text-sm">{task.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {processing && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
                    <p className="text-white/70">Analyzing document...</p>
                    <p className="text-white/40 text-sm mt-1">
                      Using specialized AI model for optimal results
                    </p>
                  </div>
                )}

                {taskResult && !processing && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Analysis Result
                      </h3>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs hover:bg-white/10 transition">
                        <History className="w-3 h-3" />
                        Version 1
                      </button>
                    </div>
                    {extractedData && (
                      <p className="text-white/40 text-xs mb-3">
                        Extracted from document_contents.content_text
                      </p>
                    )}
                    <pre className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed bg-black/30 p-4 rounded border border-white/10 overflow-x-auto">
                      {taskResult}
                    </pre>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-white/40 text-xs">
                        All outputs include version histories and clickable citations
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
