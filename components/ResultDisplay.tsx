import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GeneratedExamData, ExamConfig } from '../types.ts';
import { Printer, ChevronLeft, FileSpreadsheet, ListChecks, FileText, CheckSquare, Save, FileType, Check, Info, ClipboardCopy, FileDown, Loader2 } from 'lucide-react';
import { saveExam } from '../services/storageService.ts';
import MatrixSample from './MatrixSample.tsx';

interface Props {
  data: GeneratedExamData;
  config: ExamConfig;
  onBack: () => void;
}

const ResultDisplay: React.FC<Props> = ({ data, config, onBack }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'spec' | 'exam' | 'answers'>('matrix');
  const [isSaved, setIsSaved] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  const [printSettings, setPrintSettings] = useState({
    examName: `HỒ SƠ ĐỀ KIỂM TRA ĐỊNH KÌ`,
    subHeader: `(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)`,
    orientation: 'landscape' as 'landscape' | 'portrait'
  });

  useEffect(() => {
    setPrintSettings(prev => ({ 
      ...prev, 
      orientation: (activeTab === 'matrix' || activeTab === 'spec') ? 'landscape' : 'portrait' 
    }));
  }, [activeTab]);

  useEffect(() => {
    // Re-run MathJax typesetting when content changes to ensure LaTeX renders correctly
    if ((activeTab === 'exam' || activeTab === 'answers') && typeof (window as any).MathJax?.typesetPromise === 'function') {
      setTimeout(() => (window as any).MathJax.typesetPromise(), 100);
    }
  }, [data, activeTab]);

  const handleCopyToClipboard = () => {
    if (!data.matrix || activeTab !== 'matrix') return;
    navigator.clipboard.writeText(data.matrix).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    }).catch(err => {
      console.error('Failed to copy matrix HTML: ', err);
      alert('Lỗi khi sao chép ma trận.');
    });
  };

  const exportToWord = () => {
    const content = document.getElementById('print-area')?.innerHTML;
    if (!content) return;
    
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'>
      <style>
        @page Section1 { size: ${activeTab === 'matrix' || activeTab === 'spec' ? '29.7cm 21.0cm' : '21.0cm 29.7cm'}; margin: 1cm 1cm; mso-page-orientation: ${activeTab === 'matrix' || activeTab === 'spec' ? 'landscape' : 'portrait'}; }
        div.Section1 { page: Section1; }
        body { font-family: "Times New Roman", serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 4px; text-align: center; vertical-align: middle; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .text-uppercase { text-transform: uppercase; }
        .italic { font-style: italic; }
      </style>
      </head><body><div class="Section1">
    `;
    const blob = new Blob(['\ufeff', header + content + "</div></body></html>"], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ho_So_7991_${config.subject}_${activeTab}.doc`;
    link.click();
  };

  const exportToPdf = async () => {
    setIsExportingPdf(true);
    const input = document.getElementById('print-area');
    if (!input) {
      setIsExportingPdf(false);
      return;
    }

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: printSettings.orientation,
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      const ratio = imgProps.width / imgProps.height;
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = imgWidth / ratio;
      const usablePdfHeight = pdfHeight - margin * 2;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= usablePdfHeight;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= usablePdfHeight;
      }
      
      pdf.save(`Ho_So_7991_${config.subject}_${activeTab}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert('Đã xảy ra lỗi khi xuất file PDF. Vui lòng thử lại.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const tabs = [
    { id: 'matrix', label: 'MA TRẬN (PHỤ LỤC 1)', icon: FileSpreadsheet },
    { id: 'spec', label: 'ĐẶC TẢ (PHỤ LỤC 2)', icon: ListChecks },
    { id: 'exam', label: 'ĐỀ KIỂM TRA', icon: FileText },
    { id: 'answers', label: 'ĐÁP ÁN', icon: CheckSquare },
  ] as const;

  return (
    <div className="flex flex-col h-full relative">
      <style>{`
        .doc-preview { font-family: 'Times New Roman', serif; color: black; line-height: 1.3; }
        
        /* Table Styles for Matrix & Specification */
        .doc-preview table { border-collapse: collapse; width: 100%; border: 1.5px solid black; margin-bottom: 1rem; }
        .doc-preview th, .doc-preview td { border: 0.5pt solid black; padding: 4px 2px; text-align: center; vertical-align: middle; font-size: 10pt; }
        .doc-preview thead th { background-color: #f8fafc; font-weight: bold; font-size: 9pt; }
        
        /* Specific overrides for alignment */
        .doc-preview td:nth-child(2), /* Chương */
        .doc-preview td:nth-child(3)  /* Nội dung */
        { text-align: left !important; padding-left: 5px !important; }

        /* Specification "Yêu cầu cần đạt" column usually column 4 */
        .spec-7791-container td:nth-child(4) { text-align: left !important; padding: 5px !important; text-align: justify !important; }

        .doc-preview .header-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: none !important; }
        .doc-preview .header-table td { border: none !important; padding: 2px; vertical-align: top; }
        
        /* New styles for exam paper */
        .exam-paper-container {
          font-size: 12pt;
          line-height: 1.6;
        }
        .exam-paper-container h2 {
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            font-size: 13pt;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
        .exam-paper-container p {
            margin-bottom: 1.25rem; /* Increased for better question separation */
            text-align: justify;
        }
        /* Ensure MathJax fonts are consistent */
        .exam-paper-container mjx-container { /* MathJax v3 uses custom elements */
            font-size: 105% !important;
        }

        @media print {
          @page { size: ${activeTab === 'matrix' || activeTab === 'spec' ? 'landscape' : 'portrait'}; margin: 1cm; }
          .no-print { display: none !important; }
          body { background: white; }
          .doc-preview { width: 100% !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          .doc-preview table { page-break-inside: auto; }
          .doc-preview tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>

      {/* Action Bar */}
      <div className="no-print bg-white border-b px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition"><ChevronLeft size={20} /></button>
          <button onClick={() => setShowSample(true)} className="flex items-center gap-2 px-3 py-1.5 text-blue-700 bg-blue-50 rounded-lg font-bold text-xs border border-blue-100">
            <Info size={16} /> <span className="hidden sm:inline">Đối soát mẫu 7991</span>
          </button>
        </div>
        
        <div className="flex gap-2 flex-wrap justify-end">
          {activeTab === 'matrix' && (
            <button 
              onClick={handleCopyToClipboard} 
              disabled={copyStatus === 'copied'}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${copyStatus === 'copied' ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {copyStatus === 'copied' ? <Check size={18} /> : <ClipboardCopy size={18} />}
              <span className="hidden sm:inline">{copyStatus === 'copied' ? 'Đã sao chép!' : 'Sao chép HTML'}</span>
            </button>
          )}
          <button 
            onClick={exportToPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-wait"
          >
            {isExportingPdf ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="hidden sm:inline">Đang xuất...</span>
              </>
            ) : (
              <>
                <FileDown size={18} />
                <span className="hidden sm:inline">Xuất PDF</span>
              </>
            )}
          </button>
          <button onClick={exportToWord} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-800">
            <FileType size={18} /> <span className="hidden sm:inline">Xuất Word</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-black">
            <Printer size={18} /> <span className="hidden sm:inline">In ngay</span>
          </button>
          <button onClick={() => { saveExam(config, data, `Hồ sơ ${config.subject}`); setIsSaved(true); }} 
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${isSaved ? 'bg-green-100 text-green-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            {isSaved ? <Check size={18} /> : <Save size={18} />} <span className="hidden sm:inline">{isSaved ? 'Đã lưu' : 'Lưu trữ'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-grow bg-slate-50 h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <div className="no-print w-full md:w-64 bg-white border-b md:border-b-0 md:border-r flex flex-row md:flex-col p-2 md:p-4 gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === tab.id ? 'bg-blue-700 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-white">
          <div className={`bg-white p-4 sm:p-8 md:p-12 min-h-[29.7cm] transition-all duration-500 ${printSettings.orientation === 'landscape' ? 'w-[29.7cm]' : 'w-[21cm]'}`}>
            <div id="print-area" className="doc-preview">
              
              {/* HEADER LOGIC */}
              {(activeTab === 'matrix' || activeTab === 'spec') && (
                <>
                  <div className="text-center mb-6">
                    <p className="font-bold text-[11pt]">PHỤ LỤC {activeTab === 'matrix' ? '1' : '2'}</p>
                    <p className="italic text-[10pt] mb-2">{printSettings.subHeader}</p>
                    <h3 className="text-lg font-bold uppercase mt-4 mb-2">{activeTab === 'matrix' ? 'KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ' : 'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ'}</h3>
                    <p className="font-bold uppercase text-[11pt]">MÔN: {config.subject.toUpperCase()} - LỚP {config.grade}</p>
                    <p className="italic text-[10pt]">Thời gian làm bài: {config.duration} phút</p>
                  </div>
                </>
              )}

              {activeTab === 'exam' && (
                <div className="mb-8">
                  <table className="header-table">
                    <tbody>
                      <tr>
                        <td className="text-center w-[40%]">
                          <p className="font-bold uppercase m-0 text-[10pt]">PHÒNG GD&ĐT ....................</p>
                          <p className="font-bold uppercase m-0 text-[10pt]">TRƯỜNG ....................</p>
                          <div className="w-[30%] h-[1px] bg-black mx-auto my-1"></div>
                        </td>
                        <td className="text-center w-[60%]">
                          <p className="font-bold uppercase m-0 text-[11pt]">ĐỀ KIỂM TRA {config.examType.toUpperCase()}</p>
                          <p className="font-bold uppercase m-0 text-[11pt]">NĂM HỌC 20.... - 20....</p>
                          <p className="font-bold uppercase m-0 text-[11pt]">MÔN: {config.subject.toUpperCase()} - LỚP {config.grade}</p>
                          <p className="italic m-0 text-[10pt]">Thời gian làm bài: {config.duration} phút</p>
                          <p className="italic m-0 text-[9pt]">(Không kể thời gian phát đề)</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table className="header-table" style={{border: '1px solid black', marginTop: '10px'}}>
                    <tbody>
                      <tr>
                        <td style={{border: '1px solid black', width: '15%', fontWeight: 'bold', padding: '5px 10px'}}>Họ và tên:</td>
                        <td style={{border: '1px solid black', padding: '5px 10px'}}></td>
                        <td style={{border: '1px solid black', width: '10%', fontWeight: 'bold', padding: '5px 10px'}}>Lớp:</td>
                        <td style={{border: '1px solid black', width: '15%', padding: '5px 10px'}}></td>
                      </tr>
                    </tbody>
                  </table>
                  
                   <div className="mt-4 mb-2 text-center font-bold text-[11pt] uppercase">
                     ĐỀ BÀI
                   </div>
                </div>
              )}

              {activeTab === 'answers' && (
                <div className="text-center mb-8">
                  <p className="font-bold uppercase text-[11pt]">HƯỚNG DẪN CHẤM KIỂM TRA {config.examType.toUpperCase()}</p>
                  <p className="font-bold uppercase text-[11pt]">MÔN: {config.subject.toUpperCase()} - LỚP {config.grade}</p>
                  <div className="w-[20%] h-[1px] bg-black mx-auto my-2"></div>
                </div>
              )}

              {/* CONTENT LOGIC */}
              <div className="text-[11pt]">
                {activeTab === 'matrix' && <div className="matrix-7791-container" dangerouslySetInnerHTML={{ __html: data.matrix }} />}
                {activeTab === 'spec' && <div className="spec-7791-container" dangerouslySetInnerHTML={{ __html: data.specification }} />}
                {(activeTab === 'exam' || activeTab === 'answers') && (
                  <div className="exam-paper-container markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {activeTab === 'exam' ? data.examPaper : data.answers}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              {activeTab === 'exam' && (
                 <div className="mt-8 text-center italic text-[10pt]">
                    --- Hết ---
                 </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {showSample && <MatrixSample onClose={() => setShowSample(false)} />}
    </div>
  );
};

export default ResultDisplay;
