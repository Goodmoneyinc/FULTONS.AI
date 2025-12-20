import { useState, useEffect } from 'react';
import { Search, BookOpen, Loader2, ExternalLink, Scale, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAIResponse } from '../lib/openai';

interface ResearchResult {
  title: string;
  citation: string;
  summary: string;
  jurisdiction: string;
  type: string;
  url?: string;
  relevance: number;
}

interface Query {
  id: string;
  query_text: string;
  jurisdiction: string | null;
  results: any;
  created_at: string;
}

export function LegalResearch() {
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [recentQueries, setRecentQueries] = useState<Query[]>([]);

  useEffect(() => {
    loadRecentQueries();
  }, []);

  const loadRecentQueries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('research_queries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentQueries(data || []);
    } catch (err) {
      console.error('Error loading queries:', err);
    }
  };

  const conductResearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const jurisdictionContext = jurisdiction
        ? `Focus on ${jurisdiction} jurisdiction.`
        : 'Include relevant jurisdictions in your response.';

      const prompt = `You are a legal research assistant with access to case law databases.
A lawyer is researching: "${query}"

${jurisdictionContext}

Provide relevant legal authorities, cases, statutes, and regulations. For each result, include:
1. Title/Name of the authority
2. Full legal citation
3. Brief summary of relevance
4. Jurisdiction
5. Type (case_law, statute, regulation, treaty)

Format your response as a JSON array:
[
  {
    "title": "Case or statute name",
    "citation": "Full legal citation",
    "summary": "Brief explanation of relevance",
    "jurisdiction": "US/EU/UK/etc",
    "type": "case_law/statute/regulation/treaty",
    "relevance": 0.9
  }
]

Provide 5-8 highly relevant results. Be specific with citations.`;

      const response = await getAIResponse(prompt, 'anthropic/claude-3.5-sonnet');

      let parsedResults: ResearchResult[] = [];
      try {
        const jsonMatch = response?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResults = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsedResults = [{
          title: 'Research Results',
          citation: 'AI Analysis',
          summary: response || 'No results found',
          jurisdiction: jurisdiction || 'General',
          type: 'analysis',
          relevance: 0.5
        }];
      }

      setResults(parsedResults);

      await supabase
        .from('research_queries')
        .insert({
          user_id: user.id,
          query_text: query,
          jurisdiction: jurisdiction || null,
          results: parsedResults
        });

      await loadRecentQueries();
    } catch (err) {
      console.error('Error conducting research:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousQuery = (previousQuery: Query) => {
    setQuery(previousQuery.query_text);
    setJurisdiction(previousQuery.jurisdiction || '');
    if (previousQuery.results) {
      setResults(Array.isArray(previousQuery.results) ? previousQuery.results : [previousQuery.results]);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'case_law':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'statute':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'regulation':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'treaty':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-white/5 text-white/70 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Scale className="w-6 h-6" />
          Legal Research
        </h2>
        <p className="text-white/50 text-sm">
          Search case law, statutes, and regulations with AI-powered legal research
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-white/70 text-sm font-semibold mb-2 uppercase tracking-wide">
            Research Question
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && conductResearch()}
            placeholder="e.g., What are the requirements for a valid arbitration clause in California?"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-semibold mb-2 uppercase tracking-wide">
            Jurisdiction (Optional)
          </label>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
            disabled={loading}
          >
            <option value="">All Jurisdictions</option>
            <option value="US">United States</option>
            <option value="US-CA">California</option>
            <option value="US-NY">New York</option>
            <option value="US-DE">Delaware</option>
            <option value="EU">European Union</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
          </select>
        </div>

        <button
          onClick={conductResearch}
          disabled={!query.trim() || loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Conduct Research
            </>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide text-sm">
            Research Results
          </h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-white/20 transition"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1 text-lg">{result.title}</h4>
                    <p className="text-white/60 text-sm font-mono">{result.citation}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getTypeColor(result.type)}`}>
                      {result.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-white/70 leading-relaxed mb-3">{result.summary}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Globe className="w-4 h-4" />
                    <span>{result.jurisdiction}</span>
                  </div>

                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition text-sm font-semibold"
                    >
                      View Source
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${result.relevance * 100}%` }}
                      />
                    </div>
                    <span className="text-white/40 text-xs font-semibold">
                      {Math.round(result.relevance * 100)}% relevant
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentQueries.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide text-sm">
            Recent Research
          </h3>
          <div className="space-y-2">
            {recentQueries.map((q) => (
              <button
                key={q.id}
                onClick={() => loadPreviousQuery(q)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <BookOpen className="w-5 h-5 text-white/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{q.query_text}</p>
                      <p className="text-white/40 text-xs mt-1">
                        {new Date(q.created_at).toLocaleDateString()}
                        {q.jurisdiction && ` • ${q.jurisdiction}`}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
