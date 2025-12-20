import { useState } from 'react';
import { PenTool, Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { getDeepSeekResponse } from '../lib/openai';

export function ContractDrafting() {
  const [contractType, setContractType] = useState('');
  const [parties, setParties] = useState('');
  const [terms, setTerms] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftContract = async () => {
    if (!contractType || !parties || !terms) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prompt = `You are an expert contract drafter. Create a professional, legally sound contract based on the following requirements:

Contract Type: ${contractType}

Parties Involved: ${parties}

Key Terms & Conditions: ${terms}

Additional Requirements: ${additionalDetails || 'None specified'}

Please draft a complete, professional contract that includes:
- Proper legal formatting
- Clear definitions section
- Comprehensive terms and conditions
- Representations and warranties
- Indemnification clauses
- Termination provisions
- Governing law and dispute resolution
- Signature blocks

Make it thorough, professional, and ready for legal review.`;

      const result = await getDeepSeekResponse(prompt);
      setDraft(result.content);
      setReasoning(result.reasoning);
    } catch (err) {
      setError('Failed to draft contract. Please try again.');
      console.error('Contract drafting error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadDraft = () => {
    if (!draft) return;

    const blob = new Blob([draft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-draft-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setContractType('');
    setParties('');
    setTerms('');
    setAdditionalDetails('');
    setDraft(null);
    setReasoning(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <PenTool className="w-7 h-7 text-white" />
        <div>
          <h2 className="text-2xl font-bold text-white">Draft New Contract</h2>
          <p className="text-white/50 text-sm">
            AI-powered contract generation with DeepSeek R1
          </p>
        </div>
      </div>

      {!draft ? (
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2 uppercase tracking-wide text-xs">
              Contract Type <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              placeholder="e.g., Service Agreement, NDA, Employment Contract"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 uppercase tracking-wide text-xs">
              Parties Involved <span className="text-red-400">*</span>
            </label>
            <textarea
              value={parties}
              onChange={(e) => setParties(e.target.value)}
              placeholder="Describe the parties entering this contract (e.g., Company A as Service Provider, Company B as Client)"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 uppercase tracking-wide text-xs">
              Key Terms & Conditions <span className="text-red-400">*</span>
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="List the main terms, obligations, payment details, duration, etc."
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 uppercase tracking-wide text-xs">
              Additional Requirements
            </label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any specific clauses, jurisdictions, or special requirements"
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={draftContract}
            disabled={loading}
            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Drafting Contract...
              </>
            ) : (
              <>
                <PenTool className="w-5 h-5" />
                Generate Contract
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-400 font-medium text-sm">
                Contract drafted by DeepSeek R1
              </span>
            </div>
            <button
              onClick={downloadDraft}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded font-medium transition text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {reasoning && (
            <div className="bg-amber-50/5 border-2 border-amber-900/30 rounded-lg p-6">
              <h3 className="text-amber-200 font-bold text-lg mb-4 font-serif">
                AI Step-by-Step Reasoning:
              </h3>
              <p className="text-white/70 whitespace-pre-wrap leading-relaxed text-sm font-light">
                {reasoning}
              </p>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <pre className="text-white/80 whitespace-pre-wrap font-light leading-relaxed text-sm">
              {draft}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetForm}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
            >
              Draft Another Contract
            </button>
            <button
              onClick={draftContract}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
            >
              {loading ? 'Regenerating...' : 'Regenerate Draft'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
