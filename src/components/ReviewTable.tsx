import { useState } from 'react';
import { Table, Plus, Download, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  name: string;
}

interface Column {
  id: string;
  name: string;
  key: string;
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

const DEFAULT_COLUMNS: Column[] = [
  { id: '1', name: 'Parties', key: 'parties' },
  { id: '2', name: 'Effective Date', key: 'effectiveDate' },
  { id: '3', name: 'Contract Value', key: 'value' },
  { id: '4', name: 'Key Obligations', key: 'obligations' },
];

const SEMANTIC_BOUNDARIES = [
  'parties',
  'effective date',
  'commencement date',
  'contract value',
  'value',
  'consideration',
  'obligations',
  'key obligations',
  'terms',
  'termination',
  'governing law',
];

const getCellKey = (documentId: string, columnId: string) => `${documentId}-${columnId}`;

const extractBoundedText = (content: string, markers: string[]) => {
  const normalizedContent = content.toLowerCase();
  const startMarker = markers
    .map((marker) => ({ marker, index: normalizedContent.indexOf(marker) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (!startMarker) {
    return null;
  }

  const start = startMarker.index;
  const boundaryStart = start + startMarker.marker.length;
  const nextBoundary = SEMANTIC_BOUNDARIES
    .map((boundary) => normalizedContent.indexOf(boundary, boundaryStart))
    .filter((index) => index > boundaryStart)
    .sort((a, b) => a - b)[0];
  const end = nextBoundary ?? Math.min(content.length, start + 240);

  return content.slice(start, end).replace(/\s+/g, ' ').trim();
};

const extractFallbackValue = (contentText: string | null | undefined, columnKey: string) => {
  const content = contentText?.trim();

  if (!content) {
    return 'No content available';
  }

  // DeepSeek/AI-native structured extraction will replace these regex fallbacks
  // once the analysis service returns first-class column mappings.
  switch (columnKey) {
    case 'parties': {
      const partiesText = extractBoundedText(content, ['parties', 'between', 'by and between']);
      return partiesText || 'Not found';
    }
    case 'effectiveDate': {
      const effectiveDateText = extractBoundedText(content, ['effective date', 'commencement date']);
      const dateMatch = effectiveDateText?.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|[A-Z][a-z]+ \d{1,2}, \d{4}/);
      return dateMatch?.[0] || effectiveDateText || 'Not found';
    }
    case 'value': {
      const valueText = extractBoundedText(content, ['contract value', 'value', 'consideration', 'fees']);
      const valueMatch = valueText?.match(/\$[\d,]+(?:\.\d{2})?|USD\s?[\d,]+(?:\.\d{2})?/i);
      return valueMatch?.[0] || valueText || 'Not specified';
    }
    case 'obligations': {
      const obligationsText = extractBoundedText(content, ['obligations', 'key obligations', 'shall', 'must']);
      return obligationsText || content.slice(0, 180).replace(/\s+/g, ' ').trim();
    }
    default:
      return 'N/A';
  }
};

const escapeCsvCell = (value: string | undefined) => (value || 'N/A').replace(/"/g, '""');

export function ReviewTable({ documents }: ReviewTableProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<Column[]>([]);
  const [cells, setCells] = useState<Map<string, Cell>>(new Map());
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [building, setBuilding] = useState(false);

  const toggleDocument = (docId: string) => {
    setSelectedDocs((current) => {
      const nextSelected = new Set(current);

      if (nextSelected.has(docId)) {
        nextSelected.delete(docId);
      } else {
        nextSelected.add(docId);
      }

      return nextSelected;
    });
  };

  const buildTable = async () => {
    if (!analysisPrompt.trim() || selectedDocs.size === 0) return;

    setBuilding(true);

    setColumns(DEFAULT_COLUMNS);

    const newCells = new Map<string, Cell>();
    for (const docId of Array.from(selectedDocs)) {
      for (const col of DEFAULT_COLUMNS) {
        const cellKey = getCellKey(docId, col.id);
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

    const selectedDocumentIds = Array.from(selectedDocs);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Unable to build review table without an authenticated user:', authError);
      setCells((prev) => {
        const updated = new Map(prev);

        for (const docId of selectedDocumentIds) {
          for (const col of DEFAULT_COLUMNS) {
            updated.set(getCellKey(docId, col.id), {
              documentId: docId,
              columnId: col.id,
              value: 'Authentication required',
              loading: false,
            });
          }
        }

        return updated;
      });
      return;
    }

    for (const docId of selectedDocumentIds) {
      try {
        const { data, error } = await supabase
          .from('document_contents')
          .select('content_text')
          .eq('document_id', docId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setCells((prev) => {
          const updated = new Map(prev);

          for (const col of DEFAULT_COLUMNS) {
            updated.set(getCellKey(docId, col.id), {
              documentId: docId,
              columnId: col.id,
              value: extractFallbackValue(data?.content_text, col.key),
              loading: false,
            });
          }

          return updated;
        });
      } catch (err) {
        console.error(`Error extracting document content for ${docId}:`, err);
        setCells((prev) => {
          const updated = new Map(prev);

          for (const col of DEFAULT_COLUMNS) {
            updated.set(getCellKey(docId, col.id), {
              documentId: docId,
              columnId: col.id,
              value: 'Error',
              loading: false,
            });
          }

          return updated;
        });
      }
    }
  };

  const exportTable = () => {
    let csv = `Document,${columns.map((col) => `"${escapeCsvCell(col.name)}"`).join(',')}\n`;

    for (const docId of Array.from(selectedDocs)) {
      const doc = documents.find((document) => document.id === docId);
      let row = `"${escapeCsvCell(doc?.name)}",`;

      for (const col of columns) {
        const cellKey = getCellKey(docId, col.id);
        const cell = cells.get(cellKey);
        row += `"${(cell?.value || 'N/A').replace(/"/g, '""')}",`;
      }

      csv += `${row.slice(0, -1)}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'review-table.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getColumnIcon = (key: string) => {
    switch (key) {
      case 'parties': return '📝';
      case 'effectiveDate': return '📅';
      case 'value': return '🔢';
      case 'obligations': return '✓';
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
                        <span>{getColumnIcon(col.key)}</span>
                        <span>{col.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(selectedDocs).map((docId) => {
                  const doc = documents.find((document) => document.id === docId);

                  return (
                    <tr key={docId} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-white font-medium">{doc?.name || 'Unknown document'}</td>
                      {columns.map((col) => {
                        const cellKey = getCellKey(docId, col.id);
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
