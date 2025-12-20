import { useState, useEffect } from 'react';
import { Zap, Play, Loader2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { executeWorkflow } from '../lib/api';

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt_template: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  results: any;
  created_at: string;
}

interface WorkflowAutomationProps {
  documents: Array<{ id: string; filename: string }>;
}

export function WorkflowAutomation({ documents }: WorkflowAutomationProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('is_public', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      console.error('Error loading workflows:', err);
    }
  };

  const loadExecutions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExecutions(data || []);
    } catch (err) {
      console.error('Error loading executions:', err);
    }
  };

  const executeWorkflow = async () => {
    if (!selectedWorkflow || !selectedDocument) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: content } = await supabase
        .from('document_contents')
        .select('content_text')
        .eq('document_id', selectedDocument)
        .maybeSingle();

      if (!content) {
        throw new Error('Document content not found');
      }

      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: selectedWorkflow.id,
          user_id: user.id,
          document_id: selectedDocument,
          status: 'processing'
        })
        .select()
        .single();

      if (execError) throw execError;

      const prompt = selectedWorkflow.prompt_template.replace(
        '{{document_content}}',
        content.content_text
      );

      const response = await executeWorkflow(prompt);

      let results;
      try {
        const jsonMatch = response?.match(/\{[\s\S]*\}/);
        results = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: response };
      } catch {
        results = { analysis: response };
      }

      await supabase
        .from('workflow_executions')
        .update({
          status: 'completed',
          results: results,
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id);

      await loadExecutions();
      setSelectedWorkflow(null);
      setSelectedDocument('');
    } catch (err) {
      console.error('Error executing workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract_review':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      case 'due_diligence':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-400';
      case 'compliance':
        return 'border-green-500/30 bg-green-500/10 text-green-400';
      case 'drafting':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
      default:
        return 'border-white/10 bg-white/5 text-white/70';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Zap className="w-6 h-6" />
          Workflow Automation
        </h2>
        <p className="text-white/50 text-sm">
          Run pre-built legal analysis workflows on your documents
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide text-sm">
            Available Workflows
          </h3>
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <button
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedWorkflow?.id === workflow.id
                    ? getCategoryColor(workflow.category)
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{workflow.name}</h4>
                    <p className="text-white/60 text-sm mb-2">{workflow.description}</p>
                    <span className="text-xs uppercase tracking-wide font-semibold text-white/40">
                      {workflow.category.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedWorkflow?.id === workflow.id && (
                    <ChevronRight className="w-5 h-5 text-white/70 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide text-sm">
            Execute Workflow
          </h3>

          {selectedWorkflow ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-bold text-white mb-2">{selectedWorkflow.name}</h4>
                <p className="text-white/60 text-sm">{selectedWorkflow.description}</p>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2 uppercase tracking-wide">
                  Select Document
                </label>
                <select
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
                  disabled={loading}
                >
                  <option value="">Choose a document...</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.filename}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={executeWorkflow}
                disabled={!selectedDocument || loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
              <Zap className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">Select a workflow to get started</p>
            </div>
          )}
        </div>
      </div>

      {executions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide text-sm">
            Recent Executions
          </h3>
          <div className="space-y-3">
            {executions.map((execution) => (
              <div
                key={execution.id}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedExecution(
                      expandedExecution === execution.id ? null : execution.id
                    )
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    {execution.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : execution.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    )}
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">
                        Workflow execution
                      </p>
                      <p className="text-white/40 text-xs">
                        {new Date(execution.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      expandedExecution === execution.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {expandedExecution === execution.id && execution.results && (
                  <div className="border-t border-white/10 p-4 bg-white/3">
                    <pre className="text-white/70 text-sm whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(execution.results, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
