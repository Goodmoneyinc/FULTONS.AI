import { useState } from 'react';
import { Table, Plus, Download, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeDocument } from '../lib/api';

interface Document {
  id: string;
  name: string;
}

interface Column {
  id: string;
  name: string;
  type: 'text' | 'date' | 'number' | 'boolean';
}

interface Cell {
  documentId: string;
  columnId: string;
  value: string;
  loading: boolean;
}

interface ReviewTableProps {
  documents: Document[];
}

export function ReviewTable({ documents }: ReviewTableProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<Column[]>([]);
  const [cells, setCells] = useState<Map<string, Cell>>(new Map());
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [building, setBuilding] = useState(false);

  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const buildTable = async () => {
    if (!analysisPrompt.trim() || selectedDocs.size === 0) return;

    setBuilding(true);

    const suggestedColumns: Column[] = [
      { id: '1', name: 'Parties', type: 'text' },
      { id: '2', name: 'Effective Date', type: 'date' },
      { id: '3', name: 'Contract Value', type: 'number' },
      { id: '4', name: 'Key Terms', type: 'text' }
    ];

    setColumns(suggestedColumns);

    const newCells = new Map<string, Cell>();
    for (const docId of Array.from(selectedDocs)) {
      for (const col of suggestedColumns) {
        const cellKey = `${docId}-${col.id}`;
        newCells.set(cellKey, {
          documentId: docId,
          columnId: col.id,
          value: '',
          loading: true
        });
      }
    }
    setCells(newCells);
    setBuilding(false);

    for (const docId of Array.from(selectedDocs)) {
      for (const col of suggestedColumns) {
        const cellKey = `${docId}-${col.id}`;

        try {
          const result = await analyzeDocument(docId, 'extract');
          const extractedData = result.content;

          let cellValue = 'N/A';
          if (col.name === 'Parties' && extractedData.includes('parties')) {
            cellValue = extractedData.substring(extractedData.indexOf('parties'), extractedData.indexOf('parties') + 100);
          } else if (col.name === 'Effective Date') {
            const dateMatch = extractedData.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
            cellValue = dateMatch ? dateMatch[0] : 'Not found';
          } else if (col.name === 'Contract Value') {
            const valueMatch = extractedData.match(/\$[\d,]+/);
            cellValue = valueMatch ? valueMatch[0] : 'Not specified';
          } else if (col.name === 'Key Terms') {
            cellValue = extractedData.substring(0, 150) + '...';
          }

          setCells(prev => {
            const updated = new Map(prev);
            updated.set(cellKey, {
              documentId: docId,
              columnId: col.id,
              value: cellValue,
              loading: false
            });
            return updated;
          });
        } catch (err) {
          console.error('Error analyzing document:', err);
          setCells(prev => {
            const updated = new Map(prev);
            updated.set(cellKey, {
              documentId: docId,
              columnId: col.id,
              value: 'Error',
              loading: false
            });
            return updated;
          });
        }
      }
    }
  };

  const exportTable = () => {
    let csv = 'Document,' + columns.map(c => c.name).join(',') + '\n';

    for (const docId of Array.from(selectedDocs)) {
      const doc = documents.find(d => d.id === docId);
      let row = `"${doc?.name}",`;

      for (const col of columns) {
        const cellKey = `${docId}-${col.id}`;
        const cell = cells.get(cellKey);
        row += `"${cell?.value || ''}",`;
      }

      csv += row.slice(0, -1) + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'review-table.csv';
    a.click();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'date': return '📅';
      case 'number': return '🔢';
      case 'boolean': return '✓';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Table className="w-6 h-6" />
          Review Table
        </h2>
        <p className="text-white/50 text-sm">
          Transform manual review into structured insights across multiple documents
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-white/70 text-sm font-semibold mb-3 uppercase tracking-wide">
            Select Documents to Analyze
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => toggleDocument(doc.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition text-left ${
                  selectedDocs.has(doc.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedDocs.has(doc.id) ? 'border-blue-500 bg-blue-500' : 'border-white/30'
                }`}>
                  {selectedDocs.has(doc.id) && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className="text-white font-medium">{doc.name}</span>
              </button>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-2">
            {selectedDocs.size} document{selectedDocs.size !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div>
          <label className="block text-white/70 text-sm font-semibold mb-2 uppercase tracking-wide">
            Describe What to Analyze
          </label>
          <textarea
            value={analysisPrompt}
            onChange={(e) => setAnalysisPrompt(e.target.value)}
            placeholder="e.g., Extract contract parties, effective dates, payment terms, and key obligations"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 min-h-[100px]"
            disabled={building}
          />
        </div>

        <button
          onClick={buildTable}
          disabled={selectedDocs.size === 0 || !analysisPrompt.trim() || building}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
        >
          {building ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building Table...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Build Analysis Table
            </>
          )}
        </button>
      </div>

      {columns.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Table className="w-5 h-5" />
              Analysis Results
            </h3>
            <button
              onClick={exportTable}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-white/70 text-sm font-semibold uppercase tracking-wide bg-white/5">
                    Document
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="px-4 py-3 text-left text-white/70 text-sm font-semibold uppercase tracking-wide bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span>{getTypeIcon(col.type)}</span>
                        <span>{col.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(selectedDocs).map((docId) => {
                  const doc = documents.find(d => d.id === docId);
                  return (
                    <tr key={docId} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-white font-medium">{doc?.name}</td>
                      {columns.map((col) => {
                        const cellKey = `${docId}-${col.id}`;
                        const cell = cells.get(cellKey);
                        return (
                          <td key={col.id} className="px-4 py-3 text-white/70">
                            {cell?.loading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                <span className="text-xs text-white/40">Analyzing...</span>
                              </div>
                            ) : (
                              <span className="text-sm">{cell?.value || 'N/A'}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-white/10 bg-white/3">
            <p className="text-white/50 text-sm">
              Each cell automatically extracts data based on AI analysis. Export or continue analysis in Assistant.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
