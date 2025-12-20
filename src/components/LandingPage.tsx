import { Shield, FileText, Brain, Zap, ArrowRight, CheckCircle, Scale } from 'lucide-react';

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
              Legal AI that thinks
              <span className="block mt-2">like a lawyer</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Analyze contracts, draft documents, and research legal questions with transparent AI reasoning. Built for professionals who need precision.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for the way lawyers work</h2>
            <p className="text-white/40 text-base font-light">Specialized AI models for every legal task</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-white/10 transition">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <Brain className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Transparent reasoning</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                See step-by-step logic with DeepSeek R1. No black box decisions, just clear legal analysis.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-white/10 transition">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <FileText className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart model routing</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                Automatically selects the best AI for each task. Gemini for analysis, Claude for drafting.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:border-white/10 transition">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-5">
                <Shield className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified citations</h3>
              <p className="text-white/50 leading-relaxed text-sm font-light">
                Every answer includes page references. Prevents hallucinations with source verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">Professional legal work, accelerated</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-base mb-1">M&A due diligence</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                      Identify change of control clauses, indemnification risks, and exclusivity terms across deal documents
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-base mb-1">Regulatory compliance</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                      GDPR Article 28 DPA analysis with security requirements and recommended redlines
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-base mb-1">Contract analysis</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                      Extract parties, obligations, and key terms into structured, searchable data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-base mb-1">Document drafting</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed">
                      Generate lawyer-quality agreements and amendments with Claude 3.5 Sonnet
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-10">
              <div className="text-center mb-8">
                <Zap className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Enterprise grade</h3>
                <p className="text-white/40 text-sm font-light leading-relaxed">
                  Built for law firms with security and compliance at the core
                </p>
              </div>
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40 font-light">SOC 2 Type II</span>
                  <CheckCircle className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40 font-light">End-to-end encryption</span>
                  <CheckCircle className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40 font-light">Complete audit trails</span>
                  <CheckCircle className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40 font-light">Data residency options</span>
                  <CheckCircle className="w-4 h-4 text-white/40" />
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
