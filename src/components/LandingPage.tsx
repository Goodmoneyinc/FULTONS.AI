import { Shield, FileText, Brain, Zap, ArrowRight, CheckCircle, Scale, Database, Search, FolderOpen, GitBranch, Workflow, Mail } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed w-full bg-black/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/img_3153.jpeg" alt="Fultons Logo" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-semibold text-white tracking-tight">Fultons</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-white text-black hover:bg-white/95 rounded-md font-medium transition text-sm"
          >
            Sign In
          </button>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 mb-8">
              <Scale className="w-4 h-4" />
              <span>Trusted by leading law firms</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
              Your intelligent
              <span className="block mt-2">legal coworker</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Assistant thinks, researches, and drafts like a lawyer. Every prompt triggers 100+ model calls, benchmarked for accuracy by legal professionals.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-black hover:bg-white/95 rounded-lg font-medium transition text-base inline-flex items-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <p className="text-sm text-white/40 mt-4">No credit card required</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Research from trusted sources</h2>
            <p className="text-white/40 text-base font-light">Pull content from Lexis Nexis, Edgar, and 100+ legal data sites</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-white/10 transition">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <Database className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cross-jurisdictional insights</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                Access legal data from multiple jurisdictions. Search across case law, statutes, and regulatory filings.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-white/10 transition">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <Search className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Web-enhanced research</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                Upload a complaint, search the web for supporting evidence, and refine prompts for higher quality output.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-white/10 transition">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <FileText className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Editable documents</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                All drafts include clickable citations, version histories, and the ability to compare edits side by side.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Integrated with your workflow</h2>
            <p className="text-white/40 text-base font-light">Work seamlessly across Word, Outlook, and your document management system</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <FileText className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Word plugin</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light mb-4">
                Pull organizational precedents and use them to draft and edit documents. AI suggests edits and applies them instantly.
              </p>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                Run custom playbooks against any contract. AI analyzes and flags risky language based on your standards.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <Mail className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Outlook integration</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light mb-4">
                Draft client emails summarizing complaints and evidence. Get instant summaries of attachments.
              </p>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                Organize correspondence seamlessly into your vault with automatic filing and tagging.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-10">
              <div className="mb-8">
                <FolderOpen className="w-12 h-12 text-white/60 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Vault</h3>
                <p className="text-white/40 text-sm font-light leading-relaxed">
                  Unifies your internal knowledge, bringing matters, documents, and research into one secure workspace
                </p>
              </div>
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <p className="text-white/50 text-sm font-light">Sync with document management systems</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <p className="text-white/50 text-sm font-light">Hold up to 100 files per vault</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <p className="text-white/50 text-sm font-light">Version control and audit trails</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">Turn manual review into structured insights</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-base mb-1">Review tables</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                      Review multiple documents at once. Select files or folders, describe what to analyze, and AI builds columns with the right data types.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-base mb-1">Automatic extraction</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                      Each cell extracts answers based on columns and documents. Export results or continue analysis in Assistant.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Scale expertise with workflows</h2>
              <p className="text-white/40 text-base font-light leading-relaxed mb-8">
                Turn expert knowledge into repeatable, structured processes. Legal teams use workflows to standardize complex tasks across the firm.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                  <p className="text-white/50 text-sm font-light">Create custom workflows with simple descriptions</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                  <p className="text-white/50 text-sm font-light">Customize with golden documents and templates</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                  <p className="text-white/50 text-sm font-light">Adapt to jurisdiction, practice area, or document format</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-10">
              <div className="text-center">
                <Workflow className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Repeatable processes</h3>
                <p className="text-white/40 text-sm font-light leading-relaxed mb-8">
                  Document your firm's best practices and apply them consistently across all matters
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">
                  <GitBranch className="w-4 h-4" />
                  <span>100+ model calls per prompt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start working with AI built for lawyers</h2>
          <p className="text-white/40 text-base font-light mb-10 max-w-xl mx-auto">
            Join the law firms using Fultons for contract analysis, document drafting, and legal research
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-black hover:bg-white/95 rounded-lg font-medium transition text-base inline-flex items-center gap-2 group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
          <p className="text-sm text-white/30 mt-4 font-light">No credit card required</p>
        </div>
      </section>

      <footer className="py-10 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/img_3153.jpeg" alt="Fultons Logo" className="w-8 h-8 rounded-full" />
              <span className="text-base font-medium text-white">Fultons</span>
            </div>
            <p className="text-white/30 text-xs font-light">
              © 2024 Fultons. All rights reserved. SOC 2 Type II Certified.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
