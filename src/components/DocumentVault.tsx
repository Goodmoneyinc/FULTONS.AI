import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Loader2, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeDocument } from '../lib/api';

interface Document {
  id: string;
  name: string;
  file_path: string;
  upload_date: string;
  status: string;
  file_size: number;
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

export function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [taskResult, setTaskResult] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const runTask = async (task: VaultTask) => {
    if (!selectedDoc) return;

    setProcessing(true);
    setTaskResult('');

    try {
      const result = await analyzeDocument(selectedDoc.id, task.type);

      let formattedResult = result.content;

      if (task.type === 'extract') {
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            formattedResult = JSON.stringify(parsed, null, 2);
          }
        } catch {
          formattedResult = result.content;
        }
      }

      const modelInfo = result.documentStats.isLargeDocument
        ? '✨ Analyzed with Gemini 1.5 Flash (optimized for large documents)'
        : `✨ Analyzed with ${result.model}`;

      setTaskResult(`${modelInfo}\n\n${formattedResult}`);
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
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="w-6 h-6" />
          Document Vault
        </h2>
        <p className="text-white/50 text-sm">
          Analyze documents with specialized AI models for summarization and data extraction
        </p>
      </div>

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
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setTaskResult('');
                    }}
                    className={`w-full bg-white/5 border rounded-lg p-4 text-left transition hover:bg-white/10 ${
                      selectedDoc?.id === doc.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{doc.name}</p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(doc.upload_date).toLocaleDateString()} •{' '}
                          {(doc.file_size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <FileText className="w-5 h-5 text-white/40 flex-shrink-0" />
                    </div>
                  </button>
                ))}
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
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Analysis Result
                  </h3>
                  <pre className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed bg-black/30 p-4 rounded border border-white/10 overflow-x-auto">
                    {taskResult}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
