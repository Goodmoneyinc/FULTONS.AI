import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Only PDF files are allowed');
      return;
    }

    if (file.size > 52428800) {
      setError('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to upload documents');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          owner_id: user.id,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          status: 'uploaded',
        });

      if (dbError) {
        await supabase.storage.from('legal-documents').remove([filePath]);
        throw dbError;
      }

      const { data: documents } = await supabase
        .from('documents')
        .select('id')
        .eq('file_path', filePath)
        .single();

      if (documents) {
        const processUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`;

        fetch(processUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: documents.id,
            filePath: filePath,
          }),
        }).catch(err => {
          console.error('Error triggering processing:', err);
        });
      }

      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          dragActive
            ? 'border-white bg-white/5'
            : 'border-white/20 hover:border-white/40'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white font-medium">Uploading document...</p>
            <p className="text-white/50 text-sm">This may take a moment</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-full">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Upload Legal Document
                </h3>
                <p className="text-white/50 text-sm">
                  Drag and drop your PDF here, or click to browse
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded font-semibold hover:bg-white/90 transition cursor-pointer uppercase tracking-wide text-sm">
              <FileText className="w-4 h-4" />
              Select PDF File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />
            </label>

            <p className="text-white/40 text-xs mt-4 uppercase tracking-wider">
              Maximum file size: 50MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
