import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, X, BookOpen, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { callLegalAssistant } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  created_at: string;
}

interface Citation {
  text: string;
  type: string;
  url?: string;
}

interface LegalAssistantProps {
  documentId?: string;
  documentName?: string;
  onClose: () => void;
}

export function LegalAssistant({ documentId, documentName, onClose }: LegalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (documentId) {
        const { data: content } = await supabase
          .from('document_contents')
          .select('content_text')
          .eq('document_id', documentId)
          .maybeSingle();

        if (content) {
          setDocumentContent(content.content_text);
        }
      }

      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          document_id: documentId || null,
          session_title: documentName || 'General Legal Q&A'
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(session.id);

      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: documentId
          ? `I'm your legal AI assistant. I've analyzed "${documentName}" and I'm ready to answer questions about it. What would you like to know?`
          : "I'm your legal AI assistant. I can help you with legal questions, explain complex clauses, and provide guidance on legal matters. How can I assist you today?",
        created_at: new Date().toISOString()
      };

      setMessages([welcomeMessage]);
    } catch (err) {
      console.error('Error initializing session:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: 'user',
          content: userMessage.content
        });

      let prompt = '';
      if (documentContent) {
        prompt = `You are a senior legal AI assistant at a top law firm. A user has uploaded a document and is asking questions about it.

Document: "${documentName}"
Document Content (excerpt):
${documentContent.substring(0, 3000)}

User Question: ${userMessage.content}

Provide a clear, authoritative answer. If you reference specific clauses or sections, quote them directly. If you cite legal principles, provide the source (case law, statute, etc.).

Format your response with:
1. Direct answer to the question
2. Relevant quotes from the document (if applicable)
3. Legal reasoning or implications
4. Any recommendations or next steps

If you cite external legal sources, format them as: [SOURCE: citation text | type: case_law/statute/regulation]`;
      } else {
        prompt = `You are a senior legal AI assistant at a top law firm.

User Question: ${userMessage.content}

Provide clear, authoritative legal guidance. When citing legal principles:
- Reference specific cases, statutes, or regulations
- Provide jurisdiction (US, EU, UK, etc.)
- Format citations as: [SOURCE: citation text | type: case_law/statute/regulation | jurisdiction: US/EU/etc.]

Be precise, professional, and cite your sources.`;
      }

      const response = await callLegalAssistant(prompt, 'anthropic/claude-3.5-sonnet');

      const citations: Citation[] = [];
      const citationRegex = /\[SOURCE: ([^\|]+) \| type: ([^\|]+)(?:\| jurisdiction: ([^\]]+))?\]/g;
      let match;

      while ((match = citationRegex.exec(response || '')) !== null) {
        citations.push({
          text: match[1].trim(),
          type: match[2].trim(),
          url: undefined
        });
      }

      const cleanResponse = response?.replace(citationRegex, '') || 'I apologize, but I was unable to generate a response.';

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: cleanResponse.trim(),
        citations: citations.length > 0 ? citations : undefined,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: assistantMessage.content,
          citations: citations
        });

      if (citations.length > 0 && documentId) {
        for (const citation of citations) {
          await supabase
            .from('citations')
            .insert({
              document_id: documentId,
              citation_text: citation.text,
              citation_type: citation.type,
              relevance_score: 0.8
            });
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="bg-black border border-white/20 rounded-lg max-w-4xl w-full h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-7 h-7" />
              Legal AI Assistant
            </h2>
            {documentName && (
              <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Context: {documentName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition text-2xl p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 border border-white/10 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                {message.citations && message.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                        Citations
                      </span>
                    </div>
                    <div className="space-y-2">
                      {message.citations.map((citation, idx) => (
                        <div key={idx} className="bg-white/5 rounded p-2">
                          <p className="text-xs text-white/70 leading-relaxed">{citation.text}</p>
                          <span className="text-xs text-white/40 uppercase mt-1 inline-block">
                            {citation.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-white/70">Analyzing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-6 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a legal question..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg font-semibold transition flex items-center gap-2 uppercase tracking-wide text-sm"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
