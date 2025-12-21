import { useState } from 'react';
import { FileText, Mail, Download, Upload, CheckCircle, AlertCircle, Sparkles, Play } from 'lucide-react';

export function Integrations() {
  const [wordConnected, setWordConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [playbook, setPlaybook] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const connectWord = () => {
    setWordConnected(true);
  };

  const connectOutlook = () => {
    setOutlookConnected(true);
  };

  const analyzeWithPlaybook = async () => {
    if (!playbook.trim()) return;

    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 2000);
  };

  const draftEmail = () => {
    setEmailDraft(`Dear Client,

Following our review of the complaint filed against your company, we have identified several strong pieces of evidence for your defense:

1. Prior Art Documentation: Patents filed 3 years before the plaintiff's claim
2. Witness Testimony: 5 corroborating witnesses confirming timeline
3. Financial Records: Clear documentation of independent development

We recommend proceeding with a motion to dismiss based on these grounds.

Best regards,
Your Legal Team`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
        <p className="text-white/50 text-sm">
          Connect with Word, Outlook, and your document management system
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Word Plugin</h3>
                <p className="text-white/50 text-sm">Draft and edit documents with AI</p>
              </div>
            </div>
            {wordConnected ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-white/30" />
            )}
          </div>

          {!wordConnected ? (
            <button
              onClick={connectWord}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
            >
              Connect Word
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 text-sm">Features Available:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Pull organizational precedents
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    AI-suggested edits
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Instant application of changes
                  </li>
                </ul>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2 uppercase tracking-wide">
                  Run Custom Playbook
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={playbook}
                    onChange={(e) => setPlaybook(e.target.value)}
                    placeholder="Describe your contract standards..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30 text-sm"
                  />
                  <button
                    onClick={analyzeWithPlaybook}
                    disabled={analyzing || !playbook.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg font-semibold transition text-sm"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  AI will flag risky language based on your playbook
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Outlook Integration</h3>
                <p className="text-white/50 text-sm">Draft emails and manage correspondence</p>
              </div>
            </div>
            {outlookConnected ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-white/30" />
            )}
          </div>

          {!outlookConnected ? (
            <button
              onClick={connectOutlook}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition uppercase tracking-wide text-sm"
            >
              Connect Outlook
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 text-sm">Features Available:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Draft client emails
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Instant attachment summaries
                  </li>
                  <li className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Auto-organize to vault
                  </li>
                </ul>
              </div>

              <button
                onClick={draftEmail}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Draft Client Email
              </button>

              {emailDraft && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium text-sm">Email Draft</h4>
                    <button className="text-blue-400 text-xs hover:text-blue-300 transition">
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                    {emailDraft}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Document Management System Sync</h3>
            <p className="text-white/50 text-sm">Automatically sync vaults with your DMS</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-white font-medium mb-1">iManage</p>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition">
              Connect
            </button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-white font-medium mb-1">NetDocuments</p>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition">
              Connect
            </button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-white font-medium mb-1">SharePoint</p>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
