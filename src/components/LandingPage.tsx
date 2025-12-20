import { Shield, FileText, Brain, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed w-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/img_3153.jpeg" alt="Fultons Logo" className="w-12 h-12 rounded-full" />
            <div>
              <span className="text-xl font-bold text-white tracking-tight">FULTONS</span>
              <span className="text-xs text-white/50 uppercase tracking-widest block">Legal AI Platform</span>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-semibold transition uppercase tracking-wide text-sm"
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Professional Legal AI
              <span className="block text-white/50 mt-2">Powered by Advanced Reasoning</span>
            </h1>
            <p className="text-xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
              Contract analysis with DeepSeek R1 reasoning models, intelligent document summarization with Gemini 1.5, and precision drafting with Claude 3.5 Sonnet
            </p>
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-black hover:bg-white/90 rounded-lg font-bold transition uppercase tracking-wide text-sm inline-flex items-center gap-3 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Legal Teams Choose Fultons</h2>
            <p className="text-white/50 text-lg">Industry-leading AI models specialized for legal work</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Reasoning</h3>
              <p className="text-white/60 leading-relaxed">
                See the AI's step-by-step logic with DeepSeek R1's reasoning capture. No black box decisions.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Model Selection</h3>
              <p className="text-white/60 leading-relaxed">
                Automatically uses Gemini 1.5 Flash for large documents, Claude for drafting, and specialized models for each task.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Citations</h3>
              <p className="text-white/60 leading-relaxed">
                Every answer includes page references and verified citations. Prevents AI hallucinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 border-t border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Built for Professional Legal Work</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">M&A Due Diligence</h3>
                    <p className="text-white/60">Identify change of control clauses, indemnification risks, and exclusivity terms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">GDPR Compliance Review</h3>
                    <p className="text-white/60">Article 28 DPA analysis with security requirements and recommended redlines</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Document Intelligence</h3>
                    <p className="text-white/60">Extract parties, dates, and obligations into structured data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Contract Drafting</h3>
                    <p className="text-white/60">Generate lawyer-quality prose with Claude 3.5 Sonnet</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 rounded-lg p-12 text-center">
              <Zap className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">Enterprise Ready</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                SOC2 Type II certified, end-to-end encryption, and complete audit trails for compliance
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Legal Workflow?</h2>
          <p className="text-white/60 text-lg mb-10">
            Join law firms using AI-powered contract analysis and drafting
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-black hover:bg-white/90 rounded-lg font-bold transition uppercase tracking-wide text-sm inline-flex items-center gap-3 group"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>

      <footer className="py-12 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src="/img_3153.jpeg" alt="Fultons Logo" className="w-10 h-10 rounded-full" />
              <div>
                <span className="text-lg font-bold text-white tracking-tight block">FULTONS</span>
                <span className="text-xs text-white/40">Professional Legal AI</span>
              </div>
            </div>
            <p className="text-white/40 text-sm uppercase tracking-wider">
              © 2024 Fultons. All rights reserved. SOC2 Type II Certified.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
