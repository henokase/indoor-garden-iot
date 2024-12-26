import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useResourceStats } from '../../hooks/useResourceUsage';
import { useState } from 'react';
import { generateAnalyticsReport } from '../../utils/pdfGenerator';

export function AnalysisDownloadButton({ dateRange }) {
  const { data: resourceStats, isLoading: statsLoading } = useResourceStats(dateRange);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use actual data or fall back to defaults
  const stats = resourceStats;

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      generateAnalyticsReport(doc, stats, dateRange);
      doc.save('indoor-garden-analytics-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={statsLoading || isGenerating}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        backgroundColor: 'rgb(34, 197, 94)',
        color: 'rgb(255, 255, 255)',
        borderRadius: '0.375rem',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        opacity: isGenerating ? '0.5' : '1',
        transition: 'background-color 0.3s ease'
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgb(21, 128, 61)'}
      onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgb(34, 197, 94)'}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: 'rgb(255, 255, 255)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating Report...
        </>
      ) : (
        <>
          <FileDown style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
          Download Analysis Report
        </>
      )}
    </button>
  );
}