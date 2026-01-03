// FIX: Corrected the import syntax for useState and useEffect.
import React, { useState, useEffect } from 'react';
import ExamForm from './components/ExamForm.tsx';
import ResultDisplay from './components/ResultDisplay.tsx';
import SavedExamsList from './components/SavedExamsList.tsx';
import MatrixSample from './components/MatrixSample.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import Guide from './components/Guide.tsx'; // Import the new Guide component
import { ExamConfig, GeneratedExamData, GenerationState, SavedExam, ExamType, QuestionFormat } from './types.ts';
import { generateExamContent } from './services/geminiService.ts';
import { getSavedExams, deleteExam } from './services/storageService.ts';
import { BookOpen, History, PlusCircle, Sparkles, FileSpreadsheet, BotMessageSquare, ChevronDown } from 'lucide-react';

const INITIAL_CONFIG: ExamConfig = {
  subject: 'Toán học',
  grade: '6',
  textbook: ['Kết nối tri thức với cuộc sống'],
  scopeType: 'chapter',
  examType: ExamType.MID_TERM,
  duration: 60,
  scopeItems: [{ id: '1', chapter: '', name: '', periods: 0 }],
  format: QuestionFormat.COMBINED,
  inputMode: 'manual',
  questionCounts: { part1: 10, part2: 5, part3: 5, part4: 4 },
  levelDistribution: { awareness: 40, understanding: 30, application: 30 }
};

const App: React.FC = () => {
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null,
  });
  const [formConfig, setFormConfig] = useState<ExamConfig>(INITIAL_CONFIG);
  const [currentConfigForResults, setCurrentConfigForResults] = useState<ExamConfig | null>(null);
  const [view, setView] = useState<'form' | 'results' | 'history'>('form');
  const [savedExams, setSavedExams] = useState<SavedExam[]>([]);
  const [showSampleMatrix, setShowSampleMatrix] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // State for the guide modal

  useEffect(() => {
    if (view === 'history') {
      setSavedExams(getSavedExams());
    }
  }, [view]);

  const handleCreateExam = async (config: ExamConfig) => {
    setState({ isLoading: true, error: null, data: null });
    setCurrentConfigForResults(config);
    try {
      const result = await generateExamContent(config);
      setState({ isLoading: false, error: null, data: result });
      setView('results');
    } catch (error) {
      console.error(error);
      setState({ 
        isLoading: false, 
        error: "Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại kết nối mạng hoặc API Key.", 
        data: null 
      });
    }
  };

  const handleViewSavedExam = (exam: SavedExam) => {
    setState({ isLoading: false, error: null, data: exam.data });
    setCurrentConfigForResults(exam.config);
    setView('results');
  };

  const handleDeleteSavedExam = (id: string) => {
    deleteExam(id);
    setSavedExams(getSavedExams());
  };

  const reset = () => {
    setState({ isLoading: false, error: null, data: null });
    setView('form');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Watermark Background */}
      <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="flex items-center -space-x-8 opacity-50">
          <div className="w-96 h-96 rounded-full bg-gradient-to-tr from-sky-500/50 to-blue-600/50 blur-3xl"></div>
          <div className="w-96 h-96 rounded-full bg-gradient-to-bl from-violet-500/50 to-fuchsia-500/50 blur-3xl"></div>
        </div>
      </div>
      
      {/* User Profile - Top Right */}
      <div className="no-print fixed top-6 right-6 z-20">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:shadow-xl transition-shadow">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm">
            CT
          </div>
          <div>
            <p className="text-sm text-slate-900 font-bold leading-tight">Châu Văn Trà</p>
            <p className="text-xs text-slate-500 font-medium leading-tight">Long Vĩnh, Vĩnh Long</p>
          </div>
          <ChevronDown size={20} className="text-slate-400 mr-2" />
        </div>
      </div>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 z-10">
        {/* Main Content */}
        {view === 'form' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12 mt-16">
              <div className="inline-block bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-sky-100 mb-4 shadow-sm">
                <p className="font-black text-xs uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700 flex items-center gap-2">
                  <Sparkles size={14} className="text-sky-500" />
                  AI Powered Education
                </p>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-4 animate-shimmer">
                Xây dựng đề kiểm tra<br />
                Nhanh chóng & Chuẩn mực
              </h1>
              <p className="max-w-3xl mx-auto text-slate-700 font-medium">
                Hệ thống tự động hóa việc xây dựng Ma trận, Bản đặc tả và Đề kiểm tra bám sát chương trình GDPT 2018 và Công văn 7791.
              </p>
            </div>
            <ExamForm 
              onSubmit={handleCreateExam} 
              isLoading={state.isLoading}
              config={formConfig}
              setConfig={setFormConfig} 
            />
          </div>
        )}
        
        {view === 'results' && state.data && currentConfigForResults && (
          <div className="animate-in fade-in duration-500">
            <ResultDisplay data={state.data} config={currentConfigForResults} onBack={reset} />
          </div>
        )}

        {view === 'history' && (
          <div className="animate-in fade-in duration-500">
            <SavedExamsList 
              exams={savedExams} 
              onView={handleViewSavedExam} 
              onDelete={handleDeleteSavedExam} 
              onBack={() => setView('form')}
            />
          </div>
        )}

        {state.error && (
           <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-2xl z-50 border border-red-200">
             <div className="text-center">
                <h3 className="text-lg font-bold text-red-600 mb-2">Lỗi Hệ Thống</h3>
                <p className="text-gray-600 mb-4">{state.error}</p>
                <button onClick={reset} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg">Thử lại</button>
             </div>
           </div>
        )}
      </main>

      <footer className="no-print text-center py-6 px-4 z-10">
          <div className="inline-flex items-center gap-6 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
              <button onClick={() => setView('form')} className={`flex items-center gap-2 font-bold text-xs transition-colors ${view === 'form' ? 'text-blue-700' : 'text-gray-400 hover:text-blue-600'}`}>
                <PlusCircle size={16}/> TẠO MỚI
              </button>
              <div className="w-px h-4 bg-gray-200"></div>
              <button onClick={() => setView('history')} className={`flex items-center gap-2 font-bold text-xs transition-colors ${view === 'history' ? 'text-blue-700' : 'text-gray-400 hover:text-blue-600'}`}>
                <History size={16}/> LỊCH SỬ
              </button>
              <div className="w-px h-4 bg-gray-200"></div>
              <button onClick={() => setShowGuide(true)} className="flex items-center gap-2 font-bold text-xs text-gray-400 hover:text-blue-600 transition-colors">
                  <BookOpen size={16}/> HƯỚNG DẪN
              </button>
              <div className="w-px h-4 bg-gray-200"></div>
              <button onClick={() => setShowSampleMatrix(true)} className="flex items-center gap-2 font-bold text-xs text-gray-400 hover:text-blue-600 transition-colors">
                  <FileSpreadsheet size={16}/> XEM MẪU 7991
              </button>
          </div>
      </footer>

      <Guide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      {showSampleMatrix && <MatrixSample onClose={() => setShowSampleMatrix(false)} />}
      
      {/* AI Assistant FAB */}
      {view === 'form' && (
        <button 
          onClick={() => setIsAssistantOpen(true)}
          className="no-print fixed bottom-24 right-6 z-40 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center hover:scale-110 active:scale-100 transition-transform duration-200"
          title="Hỏi đáp với Trợ lý AI"
        >
          <BotMessageSquare size={32} />
        </button>
      )}

      <AIAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
        currentExamConfig={formConfig}
      />
      
    </div>
  );
};

export default App;
