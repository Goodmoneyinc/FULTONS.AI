import { Shield, Clock, TrendingDown, FileText, Brain, AlertTriangle, Check, Lock, Database, Eye, Zap, BarChart3, FileCheck } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed w-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/img_3153.jpeg" alt="Fultons Logo" className="w-16 h-16 rounded-full" />
            <span className="text-2xl font-bold text-white tracking-tight">FULTONS</span>
          </div>
          <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-white/70 hover:text-white transition font-medium tracking-wide text-sm uppercase">Features</a>
            <a href="#security" className="text-white/70 hover:text-white transition font-medium tracking-wide text-sm uppercase">Security</a>
            <a href="#pricing" className="text-white/70 hover:text-white transition font-medium tracking-wide text-sm uppercase">Pricing</a>
            <button className="px-8 py-3 bg-white text-black rounded font-semibold hover:bg-white/90 transition tracking-wide text-sm uppercase">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-32 px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 rounded mb-8">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white uppercase tracking-widest">SOC2 Type II Compliant</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[0.95] tracking-tight">
              Turn Dense Documentation into{' '}
              <span className="italic">Actionable Intel</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
              The AI-powered Document-to-Insights platform that turns weeks of manual legal review into seconds of actionable strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-10 py-5 bg-white text-black rounded font-bold text-base uppercase tracking-wider hover:bg-white/90 transition">
                Start Free Trial
              </button>
              <button className="px-10 py-5 bg-transparent border-2 border-white text-white rounded font-bold text-base uppercase tracking-wider hover:bg-white/5 transition">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded p-10">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Before</span>
              </div>
              <h3 className="text-white text-2xl font-bold mb-8">Manual Review Chaos</h3>
              <div className="bg-white/5 border border-white/10 rounded p-6">
                <FileText className="w-14 h-14 text-white/30 mb-6" />
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-2 bg-white/10 rounded" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                  ))}
                </div>
                <div className="mt-6 text-white/50 text-sm font-semibold uppercase tracking-wide">
                  ⏱ 2-3 weeks per document
                </div>
              </div>
            </div>

            <div className="bg-white border border-white rounded p-10">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-black" />
                <span className="text-xs font-bold text-black uppercase tracking-widest">After</span>
              </div>
              <h3 className="text-black text-2xl font-bold mb-8">AI-Powered Clarity</h3>
              <div className="bg-black/5 border border-black/10 rounded p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-black uppercase tracking-wide">Compliance Dashboard</span>
                  <span className="px-4 py-1.5 bg-black text-white rounded text-xs font-bold uppercase tracking-wide">96% Score</span>
                </div>
                <div className="space-y-4">
                  <ComplianceItem label="Contract Terms" score={98} />
                  <ComplianceItem label="Risk Factors" score={95} />
                  <ComplianceItem label="Data Protection" score={97} />
                  <ComplianceItem label="Liability Clauses" score={94} />
                </div>
                <div className="mt-6 text-black text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                  <Clock className="w-4 h-4" />
                  45 seconds analysis
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">The Cost of Manual Review</h2>
            <p className="text-white/50 text-lg max-w-3xl mx-auto font-light">
              Every hour spent on manual document review is an hour lost to strategic legal work
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <PainPoint
              icon={<Clock className="w-10 h-10" />}
              title="The Billable Hour Trap"
              description="Senior associates spending 60-80 hours per week on document review instead of strategic legal counsel"
              stat="$45K"
              statLabel="Average cost per contract review"
            />
            <PainPoint
              icon={<TrendingDown className="w-10 h-10" />}
              title="Human Error at Scale"
              description="Critical clauses missed in 100+ page documents lead to costly disputes and compliance failures"
              stat="23%"
              statLabel="Miss rate for hidden liabilities"
            />
            <PainPoint
              icon={<AlertTriangle className="w-10 h-10" />}
              title="Compliance Exposure"
              description="Regulatory fines average $4.3M per violation when manual processes fail to catch issues"
              stat="$4.3M"
              statLabel="Average regulatory fine"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded p-10">
            <h3 className="text-3xl font-bold text-white mb-10 text-center">Before vs. After: Real Impact</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-6 px-6 text-white/50 font-bold uppercase tracking-wider text-xs">Task</th>
                    <th className="text-center py-6 px-6 text-white/50 font-bold uppercase tracking-wider text-xs">Manual Review</th>
                    <th className="text-center py-6 px-6 text-white font-bold uppercase tracking-wider text-xs">With Fultons AI</th>
                    <th className="text-center py-6 px-6 text-white/50 font-bold uppercase tracking-wider text-xs">Time Saved</th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    task="Contract Summarization (100 pages)"
                    manual="12-16 hours"
                    ai="45 seconds"
                    saved="99.8%"
                  />
                  <ComparisonRow
                    task="Compliance Risk Assessment"
                    manual="8-10 hours"
                    ai="2 minutes"
                    saved="98.3%"
                  />
                  <ComparisonRow
                    task="Clause Extraction & Analysis"
                    manual="6-8 hours"
                    ai="30 seconds"
                    saved="99.7%"
                  />
                  <ComparisonRow
                    task="Multi-Document Comparison"
                    manual="20-24 hours"
                    ai="3 minutes"
                    saved="99.0%"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Stop Reading. <span className="italic">Start Analyzing.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-3xl mx-auto font-light">
              Three pillars of intelligent document analysis that transform how legal teams work
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            <FeatureCard
              icon={<Zap className="w-12 h-12" />}
              title="Instant Summarization"
              description="Condense 100-page contracts into 5 key bullet points. Our AI identifies critical terms, obligations, and dates in seconds."
              features={[
                "Executive summaries in plain language",
                "Key date and deadline extraction",
                "Party obligations breakdown"
              ]}
            />
            <FeatureCard
              icon={<Eye className="w-12 h-12" />}
              title="Insight Extraction"
              description="Automatically flag non-standard clauses, hidden liabilities, and regulatory red flags before they become problems."
              features={[
                "Non-standard clause detection",
                "Hidden liability identification",
                "Regulatory compliance checking"
              ]}
              highlighted
            />
            <FeatureCard
              icon={<Brain className="w-12 h-12" />}
              title="Argument Suggestion"
              description="Use AI to suggest counter-arguments and negotiation points based on historical precedent and market standards."
              features={[
                "Precedent-based recommendations",
                "Market standard comparisons",
                "Strategic negotiation insights"
              ]}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white rounded">
                  <FileCheck className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-white">AI Drafting Assistant</h3>
              </div>
              <p className="text-white/50 mb-8 font-light leading-relaxed">
                Watch as AI highlights potential issues in real-time while you draft or review contracts
              </p>
              <div className="bg-black/30 border border-white/10 rounded p-6">
                <div className="space-y-4">
                  <ContractLine
                    text="The Vendor shall deliver all goods within"
                    highlight="30 business days"
                    type="warning"
                    note="Industry standard is 14 days"
                  />
                  <ContractLine
                    text="Liability is limited to"
                    highlight="the total contract value"
                    type="success"
                    note="Clause is market standard"
                  />
                  <ContractLine
                    text="Intellectual property rights shall"
                    highlight="transfer upon payment"
                    type="error"
                    note="High risk: Consider retention clause"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white rounded">
                  <BarChart3 className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-white">Risk Heatmap</h3>
              </div>
              <p className="text-white/50 mb-8 font-light leading-relaxed">
                Visualize risk distribution across your entire document portfolio at a glance
              </p>
              <div className="bg-black/30 border border-white/10 rounded p-6">
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {riskData.map((risk, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded flex items-center justify-center text-xs font-bold transition-transform hover:scale-105 cursor-pointer uppercase tracking-wider"
                      style={{
                        backgroundColor: risk.color,
                        color: risk.level === 'low' ? '#000000' : '#ffffff'
                      }}
                    >
                      {risk.value}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-white/70">High Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500"></div>
                    <span className="text-white/70">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500"></div>
                    <span className="text-white/70">Low Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="py-32 px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 rounded mb-8">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white uppercase tracking-widest">Enterprise-Grade Security</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">Security First. Always.</h2>
            <p className="text-white/50 text-lg max-w-3xl mx-auto font-light">
              Your data is protected by the same standards used by Fortune 500 companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <SecurityFeature
              icon={<Lock className="w-10 h-10" />}
              title="Bank-Level Encryption"
              description="AES-256 encryption at rest and TLS 1.3 in transit. Your documents are safer than your bank account."
            />
            <SecurityFeature
              icon={<Shield className="w-10 h-10" />}
              title="SOC2 Type II Certified"
              description="Independently audited and certified. We meet the highest standards for security and availability."
            />
            <SecurityFeature
              icon={<Database className="w-10 h-10" />}
              title="Zero Data Training"
              description="Your data is NEVER used to train our models. Your confidential information stays confidential."
            />
          </div>

          <div className="bg-white border border-white rounded p-12 text-center">
            <Brain className="w-20 h-20 text-black mx-auto mb-8" />
            <h3 className="text-4xl font-bold text-black mb-6 tracking-tight">Human-in-the-Loop Intelligence</h3>
            <p className="text-black/60 text-lg max-w-3xl mx-auto mb-10 font-light leading-relaxed">
              Fultons AI <span className="text-black font-semibold">suggests</span>, and the lawyer <span className="text-black font-semibold">decides</span>.
              We augment human expertise, never replace it. Every recommendation includes confidence scores and supporting evidence
              so you maintain complete control and professional judgment.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded">
                <Check className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wide text-sm">Augments Expertise</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded">
                <Check className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wide text-sm">Full Transparency</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded">
                <Check className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wide text-sm">You Decide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-8 border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
            Ready to Transform Your Legal Workflow?
          </h2>
          <p className="text-xl text-white/60 mb-12 font-light">
            Join leading law firms and corporate legal departments who have already made the switch
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-5 bg-white text-black rounded font-bold text-base uppercase tracking-wider hover:bg-white/90 transition">
              Start Free Trial
            </button>
            <button className="px-10 py-5 bg-transparent border-2 border-white text-white rounded font-bold text-base uppercase tracking-wider hover:bg-white/5 transition">
              Schedule Demo
            </button>
          </div>
          <p className="text-white/40 text-sm mt-8 uppercase tracking-wider">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      <footer className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img src="/img_3153.jpeg" alt="Fultons Logo" className="w-14 h-14 rounded-full" />
                <span className="text-xl font-bold text-white tracking-tight">FULTONS</span>
              </div>
              <p className="text-white/40 text-sm font-light leading-relaxed">
                AI-powered legal intelligence for the modern law firm.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-3 text-white/50 text-sm font-light">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-3 text-white/50 text-sm font-light">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-3 text-white/50 text-sm font-light">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm uppercase tracking-wider">
            <p>© 2024 Fultons. All rights reserved. SOC2 Type II Certified.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ComplianceItem({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2 uppercase tracking-wider">
        <span className="text-black/60 font-semibold">{label}</span>
        <span className="text-black font-bold">{score}%</span>
      </div>
      <div className="h-2 bg-black/10 rounded overflow-hidden">
        <div
          className="h-full bg-black rounded"
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}

function PainPoint({ icon, title, description, stat, statLabel }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded p-8">
      <div className="text-red-500 mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-white/50 mb-6 text-sm font-light leading-relaxed">{description}</p>
      <div className="pt-6 border-t border-white/10">
        <div className="text-4xl font-bold text-white mb-2">{stat}</div>
        <div className="text-xs text-white/40 uppercase tracking-widest font-semibold">{statLabel}</div>
      </div>
    </div>
  );
}

function ComparisonRow({ task, manual, ai, saved }: {
  task: string;
  manual: string;
  ai: string;
  saved: string;
}) {
  return (
    <tr className="border-b border-white/10">
      <td className="py-6 px-6 text-white font-medium">{task}</td>
      <td className="py-6 px-6 text-center text-white/40 font-light">{manual}</td>
      <td className="py-6 px-6 text-center text-white font-bold">{ai}</td>
      <td className="py-6 px-6 text-center text-emerald-400 font-bold">{saved}</td>
    </tr>
  );
}

function FeatureCard({ icon, title, description, features, highlighted }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded p-10 ${highlighted ? 'bg-white border border-white' : 'bg-white/5 border border-white/10'}`}>
      <div className={`${highlighted ? 'text-black' : 'text-white'} mb-6`}>{icon}</div>
      <h3 className={`text-3xl font-bold mb-6 ${highlighted ? 'text-black' : 'text-white'}`}>{title}</h3>
      <p className={`mb-8 leading-relaxed font-light ${highlighted ? 'text-black/60' : 'text-white/50'}`}>{description}</p>
      <ul className="space-y-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className={`w-5 h-5 flex-shrink-0 mt-1 ${highlighted ? 'text-black' : 'text-white'}`} />
            <span className={`text-sm font-light ${highlighted ? 'text-black/70' : 'text-white/60'}`}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContractLine({ text, highlight, type, note }: {
  text: string;
  highlight: string;
  type: 'success' | 'warning' | 'error';
  note: string;
}) {
  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    error: 'bg-red-500/10 border-red-500/30'
  };

  const badgeColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };

  return (
    <div className={`p-4 rounded border ${colors[type]}`}>
      <div className="text-sm text-white/80 mb-3 font-light">
        {text} <span className="font-semibold text-white">{highlight}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${badgeColors[type]}`}></div>
        <span className="text-xs text-white/60 uppercase tracking-wide font-semibold">{note}</span>
      </div>
    </div>
  );
}

function SecurityFeature({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded p-8">
      <div className="text-white mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-white/50 text-sm font-light leading-relaxed">{description}</p>
    </div>
  );
}

const riskData = [
  { value: 'C1', level: 'low', color: '#10b981' },
  { value: 'C2', level: 'low', color: '#10b981' },
  { value: 'C3', level: 'medium', color: '#f59e0b' },
  { value: 'C4', level: 'low', color: '#10b981' },
  { value: 'C5', level: 'low', color: '#10b981' },
  { value: 'C6', level: 'high', color: '#ef4444' },
  { value: 'C7', level: 'low', color: '#10b981' },
  { value: 'C8', level: 'medium', color: '#f59e0b' },
  { value: 'C9', level: 'low', color: '#10b981' },
  { value: 'C10', level: 'low', color: '#10b981' },
  { value: 'C11', level: 'medium', color: '#f59e0b' },
  { value: 'C12', level: 'low', color: '#10b981' },
  { value: 'C13', level: 'high', color: '#ef4444' },
  { value: 'C14', level: 'low', color: '#10b981' },
  { value: 'C15', level: 'low', color: '#10b981' },
  { value: 'C16', level: 'low', color: '#10b981' },
];

export default App;
