import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { supabase, type Document } from '../lib/supabase';

interface DocumentListProps {
  refreshTrigger: number;
}

export function DocumentList({ refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

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
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
        >
          <div className="flex items-start justify-between gap-4">
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded">
                {getStatusIcon(doc.status)}
                <span className="text-white text-sm font-medium uppercase tracking-wide">
                  {getStatusText(doc.status)}
                </span>
              </div>

              {doc.status === 'completed' && (
                <button
                  onClick={() => viewContent(doc.id)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded transition"
                  title="View extracted content"
                >
                  <Eye className="w-5 h-5 text-white" />
                </button>
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
    </div>
  );
}
