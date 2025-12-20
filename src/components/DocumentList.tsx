import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Loader2, Eye, FileSearch, MessageSquare, Trash2 } from 'lucide-react';
import { supabase, type Document } from '../lib/supabase';
import { ContractReview } from './ContractReview';
import { LegalAssistant } from './LegalAssistant';

interface DocumentListProps {
  refreshTrigger: number;
  onDocumentsChange?: () => void;
}

export function DocumentList({ refreshTrigger, onDocumentsChange }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [reviewDoc, setReviewDoc] = useState<{ name: string; content: string } | null>(null);
  const [assistantDoc, setAssistantDoc] = useState<{ id: string; name: string } | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  useEffect(() => {
    loadDocuments();

    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        () => {
          loadDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewContent = async (documentId: string) => {
    setSelectedDoc(documentId);
    setLoadingContent(true);
    setContent(null);

    try {
      const { data, error } = await supabase
        .from('document_contents')
        .select('content_text')
        .eq('document_id', documentId)
        .maybeSingle();

      if (error) throw error;

      setContent(data?.content_text || 'No content available yet');
    } catch (error) {
      console.error('Error loading content:', error);
      setContent('Failed to load content');
    } finally {
      setLoadingContent(false);
    }
  };

  const reviewContract = async (documentId: string, documentName: string) => {
    try {
      const { data, error } = await supabase
        .from('document_contents')
        .select('content_text')
        .eq('document_id', documentId)
        .maybeSingle();

      if (error) throw error;

      if (data?.content_text) {
        setReviewDoc({ name: documentName, content: data.content_text });
      }
    } catch (error) {
      console.error('Error loading content for review:', error);
    }
  };

  const toggleDocSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const bulkDelete = async () => {
    if (selectedDocs.size === 0) return;

    setBulkDeleteLoading(true);
    try {
      for (const docId of selectedDocs) {
        await supabase
          .from('documents')
          .delete()
          .eq('id', docId);
      }

      setSelectedDocs(new Set());
      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error deleting documents:', error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'uploaded':
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Ready';
      case 'failed':
        return 'Failed';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No documents yet</h3>
        <p className="text-white/50">Upload your first legal document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedDocs.size > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-400 font-semibold">
            {selectedDocs.size} document{selectedDocs.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={bulkDelete}
            disabled={bulkDeleteLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded font-semibold transition flex items-center gap-2 text-sm uppercase tracking-wide"
          >
            {bulkDeleteLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </>
            )}
          </button>
        </div>
      )}

      {documents.map((doc) => (
        <div
          key={doc.id}
          className={`bg-white/5 border rounded-lg p-6 hover:bg-white/10 transition ${
            selectedDocs.has(doc.id) ? 'border-blue-500/50' : 'border-white/10'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selectedDocs.has(doc.id)}
                onChange={() => toggleDocSelection(doc.id)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />

              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-white flex-shrink-0" />
                    <h3 className="text-white font-semibold truncate">{doc.filename}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.upload_date)}</span>
                  </div>

                  {doc.error_message && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                      <p className="text-red-400 text-sm">{doc.error_message}</p>
                    </div>
                  )}
                </div>
              </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded">
                {getStatusIcon(doc.status)}
                <span className="text-white text-sm font-medium uppercase tracking-wide">
                  {getStatusText(doc.status)}
                </span>
              </div>

              {doc.status === 'completed' && (
                <>
                  <button
                    onClick={() => setAssistantDoc({ id: doc.id, name: doc.filename })}
                    className="p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded transition"
                    title="Ask AI Assistant"
                  >
                    <MessageSquare className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => reviewContract(doc.id, doc.filename)}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded transition"
                    title="Review contract with AI"
                  >
                    <FileSearch className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => viewContent(doc.id)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded transition"
                    title="View extracted content"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-black border border-white/20 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Extracted Content</h2>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-white/50 hover:text-white transition text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="text-white/70 whitespace-pre-wrap font-light leading-relaxed text-sm">
                    {content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reviewDoc && (
        <ContractReview
          documentName={reviewDoc.name}
          content={reviewDoc.content}
          onClose={() => setReviewDoc(null)}
        />
      )}

      {assistantDoc && (
        <LegalAssistant
          documentId={assistantDoc.id}
          documentName={assistantDoc.name}
          onClose={() => setAssistantDoc(null)}
        />
      )}
    </div>
  );
}
