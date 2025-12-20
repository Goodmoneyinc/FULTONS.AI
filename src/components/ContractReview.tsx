import { useState } from 'react';
import { X, Loader2, FileSearch, AlertCircle, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { getDeepSeekResponse } from '../lib/openai';

interface Finding {
  category: string;
  clause: string;
  implication: string;
  risk_level: string;
}

interface AnalysisResult {
  findings: Finding[];
  compliance_checklist?: string[];
  recommended_redlines?: string[];
  is_dpa?: boolean;
}

type AnalysisType = 'mna' | 'gdpr';

interface ContractReviewProps {
  documentName: string;
  content: string;
  onClose: () => void;
}

export function ContractReview({ documentName, content, onClose }: ContractReviewProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('mna');

  const analyzeContract = async () => {
    setLoading(true);
    setError(null);

    try {
      let prompt = '';

      if (analysisType === 'mna') {
        prompt = `You are a senior M&A Due Diligence Attorney. Your task is to analyze the provided document text against a specific Risk Playbook.

1. CHANGE OF CONTROL: Identify any clauses requiring consent for assignment or termination upon a merger.
2. INDEMNIFICATION: Flag any uncapped liability or survival periods exceeding 24 months.
3. EXCLUSIVITY: Note any "No-Shop" or "Most Favored Nation" (MFN) clauses.

${content}

Analyze the document above. For every risk found:
1. Quote the specific clause.
2. Explain the legal implication for an acquirer.
3. Assign a Risk Level (Low/Medium/High).

If no risks are found for a category, explicitly state "No issues identified."

Return the results as a JSON object for system integration:
{
  "findings": [{
    "category": "",
    "clause": "",
    "implication": "",
    "risk_level": ""
  }]
}`;
      } else {
        prompt = `Act as a Compliance Officer. Review this contract for compliance with GDPR Article 28.

STEP 1: Identify if the document is a Data Processing Agreement (DPA).
STEP 2: Check for the mandatory "Security of Processing" clause.
STEP 3: Verify the presence of "Right to Audit" language.

REASONING RULES:
- Before providing your final answer, evaluate if any language is "ambiguous" or "hidden" in the Boilerplate sections.
- If a required clause is missing, draft a recommended replacement clause that favors the Data Controller.

${content}

OUTPUT: Provide a bulleted "Compliance Checklist" followed by "Recommended Redlines."

Return the results as a JSON object:
{
  "is_dpa": true/false,
  "compliance_checklist": ["checklist item 1", "checklist item 2", ...],
  "recommended_redlines": ["redline 1", "redline 2", ...],
  "findings": [{
    "category": "GDPR Compliance Category",
    "clause": "quoted clause or 'Missing'",
    "implication": "compliance implication",
    "risk_level": "Low/Medium/High"
  }]
}`;
      }

      const result = await getDeepSeekResponse(prompt);

      setReasoning(result.reasoning);

      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAnalysis(parsed);
      } else {
        setAnalysis({ findings: [{
          category: "General Analysis",
          clause: "Full analysis provided",
          implication: result.content,
          risk_level: "Medium"
        }]});
      }
    } catch (err) {
      setError('Failed to analyze contract. Please try again.');
      console.error('Contract analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      case 'low':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      default:
        return 'border-white/10 bg-white/5 text-white/70';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
      case 'medium':
        return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
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
              <h3 className="text-xl font-bold text-white mb-4">Select Analysis Type</h3>

              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                <button
                  onClick={() => setAnalysisType('mna')}
                  className={`p-6 rounded-lg border-2 transition ${
                    analysisType === 'mna'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                  <h4 className="font-bold text-white mb-2">M&A Due Diligence</h4>
                  <p className="text-white/50 text-sm">
                    Change of Control, Indemnification & Exclusivity
                  </p>
                </button>

                <button
                  onClick={() => setAnalysisType('gdpr')}
                  className={`p-6 rounded-lg border-2 transition ${
                    analysisType === 'gdpr'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Shield className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  <h4 className="font-bold text-white mb-2">GDPR Compliance</h4>
                  <p className="text-white/50 text-sm">
                    Article 28 DPA Review & Security Requirements
                  </p>
                </button>
              </div>

              <button
                onClick={analyzeContract}
                className={`px-8 py-3 rounded-lg font-semibold transition uppercase tracking-wide text-sm ${
                  analysisType === 'mna'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {analysisType === 'mna' ? 'Analyze for M&A Risks' : 'Check GDPR Compliance'}
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className={`w-12 h-12 animate-spin mb-4 ${
                analysisType === 'mna' ? 'text-blue-400' : 'text-green-400'
              }`} />
              <p className="text-white/70">
                {analysisType === 'mna'
                  ? 'Conducting M&A Due Diligence with DeepSeek R1...'
                  : 'Conducting GDPR Compliance Review with DeepSeek R1...'}
              </p>
              <p className="text-white/40 text-sm mt-2">
                {analysisType === 'mna'
                  ? 'Analyzing risk factors and key clauses'
                  : 'Checking Article 28 requirements and security provisions'}
              </p>
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
                  {analysisType === 'mna'
                    ? 'M&A Due Diligence Analysis completed by DeepSeek R1'
                    : 'GDPR Compliance Review completed by DeepSeek R1'}
                </span>
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

              {analysisType === 'gdpr' && analysis.is_dpa !== undefined && (
                <div className={`border rounded-lg p-4 ${
                  analysis.is_dpa
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-yellow-500/30 bg-yellow-500/10'
                }`}>
                  <div className="flex items-center gap-3">
                    {analysis.is_dpa ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    )}
                    <p className={`font-semibold ${
                      analysis.is_dpa ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {analysis.is_dpa
                        ? 'Document identified as a Data Processing Agreement (DPA)'
                        : 'Document is NOT a standard Data Processing Agreement'}
                    </p>
                  </div>
                </div>
              )}

              {analysisType === 'gdpr' && analysis.compliance_checklist && analysis.compliance_checklist.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Compliance Checklist
                  </h3>
                  <ul className="space-y-2">
                    {analysis.compliance_checklist.map((item, index) => (
                      <li key={index} className="flex gap-3 text-white/80 text-sm">
                        <span className="text-white/40 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  {analysisType === 'mna' ? 'Risk Findings' : 'Compliance Findings'}
                </h3>
                {analysis.findings.map((finding, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-5 ${getRiskColor(finding.risk_level)}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {getRiskIcon(finding.risk_level)}
                        <div>
                          <h4 className="font-bold uppercase tracking-wide text-xs">
                            {finding.category}
                          </h4>
                          <span className="text-xs font-semibold uppercase mt-1 inline-block">
                            Risk Level: {finding.risk_level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div>
                        <p className="font-semibold text-xs uppercase tracking-wide mb-1.5">Clause:</p>
                        <p className="text-sm leading-relaxed italic">"{finding.clause}"</p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs uppercase tracking-wide mb-1.5">Implication:</p>
                        <p className="text-sm leading-relaxed">{finding.implication}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {analysisType === 'gdpr' && analysis.recommended_redlines && analysis.recommended_redlines.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-blue-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <FileSearch className="w-5 h-5" />
                    Recommended Redlines
                  </h3>
                  <div className="space-y-4">
                    {analysis.recommended_redlines.map((redline, index) => (
                      <div key={index} className="bg-white/5 rounded p-4">
                        <p className="text-blue-400 text-sm leading-relaxed whitespace-pre-wrap">{redline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setReasoning(null);
                    setAnalysisType(analysisType === 'mna' ? 'gdpr' : 'mna');
                  }}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
                >
                  Switch to {analysisType === 'mna' ? 'GDPR' : 'M&A'} Analysis
                </button>
                <button
                  onClick={analyzeContract}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
                >
                  Re-analyze
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
