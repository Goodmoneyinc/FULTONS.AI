import { useState } from 'react';
import { X, Loader2, FileSearch, AlertCircle, CheckCircle } from 'lucide-react';
import { getDeepSeekResponse } from '../lib/openai';

interface ContractReviewProps {
  documentName: string;
  content: string;
  onClose: () => void;
}

export function ContractReview({ documentName, content, onClose }: ContractReviewProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeContract = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `You are an expert legal analyst. Review the following contract and provide a comprehensive analysis including:

1. Contract Type & Purpose
2. Key Parties Involved
3. Main Obligations & Rights
4. Payment Terms (if applicable)
5. Duration & Termination Clauses
6. Potential Risks or Red Flags
7. Missing or Unclear Provisions
8. Overall Assessment

Contract Document:
${content}

Provide a detailed, professional analysis.`;

      const result = await getDeepSeekResponse(prompt);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze contract. Please try again.');
      console.error('Contract analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-black border border-white/20 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileSearch className="w-7 h-7" />
              Contract Analysis
            </h2>
            <p className="text-white/50 text-sm mt-1">{documentName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition text-2xl p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!analysis && !loading && (
            <div className="text-center py-12">
              <FileSearch className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
              <p className="text-white/50 mb-6">
                DeepSeek R1 will provide a comprehensive legal analysis of this contract
              </p>
              <button
                onClick={analyzeContract}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
              >
                Analyze Contract
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-white/70">Analyzing contract with DeepSeek R1...</p>
              <p className="text-white/40 text-sm mt-2">This may take a moment</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Analysis Failed</h3>
                  <p className="text-red-400/70 text-sm">{error}</p>
                  <button
                    onClick={analyzeContract}
                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded font-medium transition text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-400 font-medium text-sm">
                  Analysis completed by DeepSeek R1
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <pre className="text-white/80 whitespace-pre-wrap font-light leading-relaxed text-sm">
                  {analysis}
                </pre>
              </div>

              <button
                onClick={analyzeContract}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
              >
                Re-analyze Contract
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
