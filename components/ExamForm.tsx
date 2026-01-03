import React, { useState, useEffect, useRef, useMemo } from 'react';
import mammoth from 'mammoth';
import { ExamConfig, ExamType, QuestionCounts, LevelDistribution, ScopeItem, QuestionFormat, InputMode, CurriculumChapter, CurriculumLesson } from '../types.ts';
import { CURRICULUM_DATA } from '../data/curriculum.ts';
import { FileText, CheckCircle, PieChart, Book, Plus, Trash2, Calculator, CalendarCheck, Save, RotateCcw, Upload, FileUp, AlertCircle, Sparkles, PlusCircle, LayoutGrid, ListChecks, Percent, ChevronDown, GripVertical, Share2, Lightbulb, Send, Compass, Scale, PencilRuler, Loader2 } from 'lucide-react';

interface Props {
  onSubmit: (config: ExamConfig) => void;
  isLoading: boolean;
  config: ExamConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExamConfig>>;
}

const SUBJECTS = [
  "Toán học", "Ngữ văn", "Ngoại ngữ 1 (Tiếng Anh)", "Khoa học tự nhiên", 
  "Lịch sử và Địa lí", "Giáo dục công dân", "Công nghệ", "Tin học", 
  "Giáo dục thể chất", "Nghệ thuật (Âm nhạc)", "Nghệ thuật (Mỹ thuật)", 
  "Hoạt động trải nghiệm, hướng nghiệp", "Nội dung giáo dục địa phương"
];

const TEXTBOOKS = [
  { name: "Kết nối tri thức với cuộc sống", icon: Share2, color: 'blue' },
  { name: "Chân trời sáng tạo", icon: Lightbulb, color: 'amber' },
  { name: "Cánh Diều", icon: Send, color: 'violet' },
];

const STORAGE_KEY_DEFAULT_CONFIG = 'exam_default_config';

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

// FIX: To prevent Tailwind CSS from purging dynamically generated class names,
// a style map is used to ensure the full class strings are present in the source code.
const questionPartStyles = {
  sky: {
    container: 'bg-sky-50 border-sky-100',
    label: 'text-sky-600',
    input: 'border-sky-200 focus:ring-sky-500/20 text-sky-700',
  },
  indigo: {
    container: 'bg-indigo-50 border-indigo-100',
    label: 'text-indigo-600',
    input: 'border-indigo-200 focus:ring-indigo-500/20 text-indigo-700',
  },
  violet: {
    container: 'bg-violet-50 border-violet-100',
    label: 'text-violet-600',
    input: 'border-violet-200 focus:ring-violet-500/20 text-violet-700',
  },
  purple: {
    container: 'bg-purple-50 border-purple-100',
    label: 'text-purple-600',
    input: 'border-purple-200 focus:ring-purple-500/20 text-purple-700',
  },
} as const;

const textbookStyles = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-600', text: 'text-blue-900', iconBg: 'bg-blue-100', iconText: 'text-blue-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-900', iconBg: 'bg-amber-100', iconText: 'text-amber-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-600', text: 'text-violet-900', iconBg: 'bg-violet-100', iconText: 'text-violet-700' },
};

type UploadStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

const ExamForm: React.FC<Props> = ({ onSubmit, isLoading, config, setConfig }) => {
  const [totalPercent, setTotalPercent] = useState(100);
  const [totalPeriods, setTotalPeriods] = useState(0);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [fileName, setFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    const savedDefault = localStorage.getItem(STORAGE_KEY_DEFAULT_CONFIG);
    if (savedDefault) {
      try {
        const parsed = JSON.parse(savedDefault);
        
        // Backward compatibility for textbook field (string -> array)
        if (parsed.textbook && typeof parsed.textbook === 'string') {
          parsed.textbook = [parsed.textbook];
        } else if (!parsed.textbook || !Array.isArray(parsed.textbook) || parsed.textbook.length === 0) {
          parsed.textbook = INITIAL_CONFIG.textbook;
        }

        if (parsed.scopeItems) {
          parsed.scopeItems = parsed.scopeItems.map((item: ScopeItem) => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9)
          }));
        }
        const cleanConfig = { ...INITIAL_CONFIG, ...parsed };
        cleanConfig.inputMode = 'manual';
        cleanConfig.uploadedContent = undefined;
        setConfig(cleanConfig);
        if (!SUBJECTS.includes(parsed.subject)) setIsCustomSubject(true);
      } catch (e) {
        console.error("Lỗi khi tải cấu hình mặc định", e);
      }
    }
  }, [setConfig]);

  const availableCurriculum = useMemo(() => {
    if (!config.subject || !config.grade || !config.textbook?.length) {
      return [];
    }
    const subjectData = CURRICULUM_DATA[config.subject]?.[config.grade];
    if (!subjectData) {
      return [];
    }
    const allChaptersRaw: CurriculumChapter[] = config.textbook.flatMap(book => subjectData[book] || []);
    const chapterMap = new Map<string, Set<string>>();
    allChaptersRaw.forEach(chapter => {
      if (!chapter.lessons) return;
      if (!chapterMap.has(chapter.chapter)) {
        chapterMap.set(chapter.chapter, new Set<string>());
      }
      const lessonSet = chapterMap.get(chapter.chapter)!;
      chapter.lessons.forEach(lesson => lessonSet.add(lesson.name));
    });
    const mergedCurriculum: CurriculumChapter[] = [];
    chapterMap.forEach((lessonNames, chapterName) => {
      mergedCurriculum.push({
        chapter: chapterName,
        lessons: Array.from(lessonNames).map(name => ({ name })),
      });
    });
    return mergedCurriculum;
  }, [config.subject, config.grade, config.textbook]);

  useEffect(() => {
    const total = config.levelDistribution.awareness + config.levelDistribution.understanding + config.levelDistribution.application;
    setTotalPercent(total);
  }, [config.levelDistribution]);

  useEffect(() => {
    const total = config.scopeItems.reduce((sum, item) => sum + (item.periods || 0), 0);
    setTotalPeriods(total);
  }, [config.scopeItems]);

  const handleChange = (field: keyof ExamConfig, value: any) => {
    if (field === 'inputMode' && value !== config.inputMode) {
      setFileName("");
      setUploadStatus({ status: 'idle', message: '' });
      setConfig((prev) => ({ ...prev, uploadedContent: undefined, [field]: value }));
    } else {
      setConfig((prev) => ({ ...prev, [field]: value }));
    }
  };
  
  const handleTextbookChange = (bookName: string, isChecked: boolean) => {
    setConfig(prev => {
      const currentBooks = Array.isArray(prev.textbook) ? prev.textbook : [];
      let newBooks;
      if (isChecked) {
        newBooks = [...currentBooks, bookName];
      } else {
        newBooks = currentBooks.filter(b => b !== bookName);
      }
      if (newBooks.length === 0) {
        return prev; // Prevent unselecting the last book
      }
      return { ...prev, textbook: newBooks };
    });
  };

  const handleLevelChange = (field: keyof LevelDistribution, value: number) => {
    setConfig(prev => ({
      ...prev,
      levelDistribution: { ...prev.levelDistribution, [field]: value }
    }));
  };

  const handleCountChange = (field: keyof QuestionCounts, value: number) => {
    setConfig(prev => ({
      ...prev,
      questionCounts: { ...prev.questionCounts, [field]: Math.max(0, value) }
    }));
  };

  const updateScopeItem = (id: string, field: keyof ScopeItem, value: any) => {
    setConfig(prev => {
      const newItems = prev.scopeItems.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, scopeItems: newItems };
    });
  };

  const addScopeItemAt = (index: number) => {
    const currentItem = config.scopeItems[index];
    const newItems = [...config.scopeItems];
    newItems.splice(index + 1, 0, { 
      id: Date.now().toString() + Math.random(), 
      chapter: currentItem.chapter,
      name: '', 
      periods: 0 
    });
    setConfig(prev => ({ ...prev, scopeItems: newItems }));
  };

  const addScopeItem = (duplicateLastChapter = false) => {
    const lastChapter = duplicateLastChapter && config.scopeItems.length > 0 
      ? config.scopeItems[config.scopeItems.length - 1].chapter 
      : '';
    setConfig(prev => ({
      ...prev,
      scopeItems: [...prev.scopeItems, { id: Date.now().toString() + Math.random(), chapter: lastChapter, name: '', periods: 0 }]
    }));
  };

  const removeScopeItem = (id: string) => {
    if (config.scopeItems.length <= 1) return;
    setConfig(prev => ({
      ...prev,
      scopeItems: prev.scopeItems.filter(item => item.id !== id)
    }));
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetItemId: string) => {
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      return;
    }

    const items = config.scopeItems;
    const draggedItem = items.find(item => item.id === draggedItemId);
    if (!draggedItem) return;

    const remainingItems = items.filter(item => item.id !== draggedItemId);
    const targetIndex = remainingItems.findIndex(item => item.id === targetItemId);

    if (targetIndex === -1) {
         setDraggedItemId(null);
         return;
    }
    
    remainingItems.splice(targetIndex, 0, draggedItem);
    
    setConfig(prev => ({ ...prev, scopeItems: remainingItems }));
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleSaveAsDefault = () => {
    localStorage.setItem(STORAGE_KEY_DEFAULT_CONFIG, JSON.stringify(config));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleResetToInitial = () => {
    if (window.confirm("Bạn có muốn xóa cấu hình mặc định và quay về thiết lập ban đầu không?")) {
      localStorage.removeItem(STORAGE_KEY_DEFAULT_CONFIG);
      setConfig(INITIAL_CONFIG);
      setIsCustomSubject(false);
      setFileName("");
      setUploadStatus({ status: 'idle', message: '' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      setUploadStatus({ status: 'error', message: 'Lỗi: Vui lòng chỉ tải lên file Word có định dạng .docx' });
      return;
    }

    setFileName(file.name);
    setUploadStatus({ status: 'loading', message: 'Đang phân tích file, vui lòng chờ...' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setConfig(prev => ({ ...prev, uploadedContent: result.value }));
        setUploadStatus({ status: 'success', message: 'Phân tích file thành công! Nội dung đã sẵn sàng để AI xử lý.' });
      } catch (error) {
        console.error("Error reading file", error);
        setUploadStatus({ status: 'error', message: 'Lỗi khi đọc file. File có thể bị hỏng hoặc không đúng định dạng.' });
      }
    };
    reader.onerror = () => {
        console.error("FileReader error");
        setUploadStatus({ status: 'error', message: 'Đã xảy ra lỗi không xác định khi đọc file.' });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.inputMode === 'manual' && totalPercent !== 100) {
      alert(`Tổng tỉ lệ mức độ nhận thức phải bằng 100%. Hiện tại: ${totalPercent}%`);
      return;
    }
    const filteredScope = config.scopeItems.filter(item => item.chapter.trim() !== '' && item.name.trim() !== '');
    if (filteredScope.length === 0 && config.inputMode === 'manual') {
      alert("Vui lòng nhập ít nhất một nội dung bài học.");
      return;
    }
    if (config.inputMode === 'upload' && !config.uploadedContent) {
      alert("Vui lòng tải lên file Ma trận/Đặc tả trước khi tiếp tục.");
      return;
    }
    onSubmit({...config, scopeItems: filteredScope.length > 0 ? filteredScope : config.scopeItems});
  };

  const totalQuestions = config.questionCounts.part1 + config.questionCounts.part2 + config.questionCounts.part3 + config.questionCounts.part4;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-xl shadow-sky-900/5 p-4 md:p-10 border border-white">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/30">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Thiết Lập Đề Kiểm Tra</h2>
            <p className="text-sm text-gray-500 font-medium">Hồ sơ 7991 (Phụ lục 1, 2) thông minh</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleSaveAsDefault}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-300 ${saveStatus === 'saved' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
            {saveStatus === 'saved' ? <CheckCircle size={14} className="text-green-600" /> : <Save size={14} />}
            <span className="hidden sm:inline">{saveStatus === 'saved' ? 'Đã lưu' : 'Lưu mặc định'}</span>
          </button>
          <button type="button" onClick={handleResetToInitial} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reset về mặc định">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex p-1 bg-gray-100 rounded-2xl font-bold text-sm mb-6">
          <button type="button" onClick={() => handleChange('inputMode', 'manual')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${config.inputMode === 'manual' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <PieChart size={18} /> Thiết lập hồ sơ
          </button>
          <button type="button" onClick={() => handleChange('inputMode', 'upload')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${config.inputMode === 'upload' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FileUp size={18} /> Tải ma trận chuẩn
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Môn học</label>
            {!isCustomSubject ? (
              <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none bg-gray-50/50 transition-all hover:bg-white font-bold text-sm appearance-none cursor-pointer"
                value={config.subject} onChange={(e) => e.target.value === 'other' ? setIsCustomSubject(true) : handleChange('subject', e.target.value)}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="other">-- Nhập môn khác --</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input type="text" autoFocus className="w-full px-4 py-3 border border-blue-600 rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none font-bold text-sm"
                  value={config.subject} onChange={(e) => handleChange('subject', e.target.value)} />
                <button type="button" onClick={() => { setIsCustomSubject(false); handleChange('subject', SUBJECTS[0]); }} className="px-3 py-2 text-xs text-gray-500 border rounded-2xl hover:bg-gray-100 font-bold">Hủy</button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Lớp / Khối</label>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none bg-gray-50/50 hover:bg-white transition-all font-bold text-sm appearance-none cursor-pointer"
              value={config.grade} onChange={(e) => handleChange('grade', e.target.value)}>
              {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</label>
            <div className="relative">
                <input type="number" min="15" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none bg-gray-50/50 hover:bg-white transition-all font-bold text-sm"
                value={config.duration} onChange={(e) => handleChange('duration', parseInt(e.target.value))} />
                <span className="absolute right-4 top-3.5 text-gray-400 text-[10px] font-black uppercase">phút</span>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
           <label className="block text-sm font-black text-gray-700 uppercase tracking-widest">Bộ sách (chọn một hoặc nhiều)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEXTBOOKS.map((book) => {
                const isChecked = config.textbook.includes(book.name);
                const styles = textbookStyles[book.color as keyof typeof textbookStyles];
                return (
                  <label key={book.name} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${isChecked ? `${styles.bg} ${styles.border} shadow-sm` : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded-md border-gray-300 text-blue-700 focus:ring-blue-600"
                      checked={isChecked} 
                      onChange={(e) => handleTextbookChange(book.name, e.target.checked)}
                    />
                    <div className={`p-1.5 rounded-lg ${isChecked ? styles.iconBg : 'bg-gray-100'}`}>
                      <book.icon size={18} className={isChecked ? styles.iconText : 'text-gray-600'}/>
                    </div>
                    <span className={`text-sm font-bold ${isChecked ? styles.text : 'text-gray-700'}`}>{book.name}</span>
                  </label>
                );
              })}
            </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <CalendarCheck size={18} className="text-blue-600"/> 1. Loại hình kiểm tra
            </label>
           </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: ExamType.REGULAR, label: 'Thường xuyên', desc: '15 phút - 1 tiết' },
              { id: ExamType.MID_TERM, label: 'Giữa kỳ', desc: 'Phụ lục 1, 2' },
              { id: ExamType.FINAL, label: 'Cuối kỳ', desc: 'Tổng kết học kỳ' },
              { id: ExamType.TOPICAL, label: 'Theo chủ đề', desc: 'Đánh giá chuyên sâu' }
            ].map((type) => {
              const isActive = config.examType === type.id;
              return (
                <button key={type.id} type="button" onClick={() => handleChange('examType', type.id)}
                  className={`relative flex flex-col items-start p-4 rounded-3xl border-2 transition-all duration-300 ${isActive ? 'border-blue-600 bg-blue-50/50 text-blue-800 shadow-md scale-[1.02]' : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200'}`}>
                  <span className="font-black uppercase tracking-tight text-sm">{type.label}</span>
                  <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{type.desc}</span>
                  {isActive && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle size={16}/></div>}
                </button>
              );
            })}
          </div>
        </div>

        {config.inputMode === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50/50 border border-blue-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-lg p-1.5 shadow-md shadow-blue-500/20">
                    <ListChecks size={24}/>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-blue-900">
                  A. Cấu trúc câu hỏi
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { key: 'part1', label: 'TN nhiều lựa chọn', color: 'sky' },
                  { key: 'part2', label: 'TN Đúng/Sai', color: 'indigo' },
                  { key: 'part3', label: 'TN Trả lời ngắn', color: 'violet' },
                  { key: 'part4', label: 'Phần Tự luận', color: 'purple' },
                ].map((part) => {
                  const styles = questionPartStyles[part.color as keyof typeof questionPartStyles];
                  return (
                    <div key={part.key} className={`p-4 rounded-2xl border flex flex-col items-center ${styles.container}`}>
                       <span className={`text-[10px] font-black uppercase mb-2 text-center ${styles.label}`}>{part.label}</span>
                       <input 
                          type="number" 
                          className={`w-16 h-10 text-center font-black text-lg bg-white border rounded-xl focus:ring-2 outline-none ${styles.input}`}
                          value={config.questionCounts[part.key as keyof QuestionCounts]}
                          onChange={(e) => handleCountChange(part.key as keyof QuestionCounts, parseInt(e.target.value) || 0)}
                        />
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 text-center text-xs font-bold text-slate-400 italic">
                 Tổng cộng: <span className="text-blue-700 text-sm font-black">{totalQuestions}</span> câu hỏi sẽ được sinh.
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-3xl p-6 shadow-sm space-y-4">
               <div className="flex items-center gap-3">
                <div className="bg-emerald-600 text-white rounded-lg p-1.5 shadow-md shadow-emerald-500/20">
                    <Percent size={24}/>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-emerald-900">
                  B. Tỉ lệ ma trận điểm (%)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                 <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center">
                    <span className="text-xs font-black text-emerald-600 uppercase mb-2">Nhận biết</span>
                    <div className="relative">
                       <input 
                          type="number" step="5"
                          className="w-20 h-10 text-center font-black text-lg bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-emerald-700 pr-5"
                          value={config.levelDistribution.awareness}
                          onChange={(e) => handleLevelChange('awareness', parseInt(e.target.value) || 0)}
                       />
                       <span className="absolute right-2.5 top-2 text-sm font-bold text-emerald-400">%</span>
                    </div>
                 </div>
                 <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 flex flex-col items-center">
                    <span className="text-xs font-black text-teal-600 uppercase mb-2">Thông hiểu</span>
                    <div className="relative">
                       <input 
                          type="number" step="5"
                          className="w-20 h-10 text-center font-black text-lg bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none text-teal-700 pr-5"
                          value={config.levelDistribution.understanding}
                          onChange={(e) => handleLevelChange('understanding', parseInt(e.target.value) || 0)}
                       />
                       <span className="absolute right-2.5 top-2 text-sm font-bold text-teal-400">%</span>
                    </div>
                 </div>
                 <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center">
                    <span className="text-xs font-black text-orange-600 uppercase mb-2">Vận dụng</span>
                    <div className="relative">
                       <input 
                          type="number" step="5"
                          className="w-20 h-10 text-center font-black text-lg bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none text-orange-700 pr-5"
                          value={config.levelDistribution.application}
                          onChange={(e) => handleLevelChange('application', parseInt(e.target.value) || 0)}
                       />
                       <span className="absolute right-2.5 top-2 text-sm font-bold text-orange-400">%</span>
                    </div>
                 </div>
              </div>
              <div className={`mt-1 text-center text-sm font-bold ${totalPercent === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                 Tổng: <span className="text-xl font-black">{totalPercent}%</span> {totalPercent !== 100 && '(Cần đạt 100%)'}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                <Book size={18} className="text-blue-600"/> 2. PHẠM VI KIẾN THỨC CHI TIẾT
            </label>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
               * Kéo thả <GripVertical size={12} className="inline-block" /> để sắp xếp thứ tự
            </div>
          </div>
          
          <p className="text-xs text-gray-500 font-medium italic -mt-2">
            Nhập chi tiết các chương và bài học sẽ được đưa vào đề kiểm tra. AI sẽ dựa vào đây để phân bổ kiến thức và tạo câu hỏi.
          </p>
          
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-3xl p-4 space-y-4 shadow-sm">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <div className="col-span-1"></div>
              <div className="col-span-4">CHƯƠNG / CHỦ ĐỀ</div>
              <div className="col-span-5">TÊN BÀI HỌC CỤ THỂ</div>
              <div className="col-span-1 text-center">SỐ TIẾT</div>
              <div className="col-span-1 text-center">TÁC VỤ</div>
            </div>

            {/* Input Rows */}
            <div className="space-y-2">
              {config.scopeItems.map((item, idx) => {
                const isDragging = draggedItemId === item.id;
                return (
                  <div 
                    key={item.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-center rounded-2xl transition-all duration-200 cursor-grab active:cursor-grabbing group
                      p-4 md:p-2 
                      ${isDragging ? 'opacity-40 bg-blue-100 shadow-lg scale-105' : 'bg-white hover:bg-blue-50/50'}
                    `}
                  >
                    <div className="md:col-span-1 flex justify-center items-center text-gray-400 group-hover:text-gray-600 transition-colors" title="Kéo để sắp xếp">
                      <GripVertical size={20} />
                    </div>
                    
                    <div className="col-span-1 md:col-span-4">
                      <label className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Chương / Chủ đề</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border-b border-gray-200 focus:border-blue-500 rounded-lg text-sm outline-none transition-all bg-transparent focus:bg-white font-bold text-blue-950" 
                        value={item.chapter} 
                        placeholder="Tên chương / Chủ đề..." 
                        onChange={(e) => updateScopeItem(item.id, 'chapter', e.target.value)} 
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-5">
                       <label className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Tên bài học</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border-b border-gray-200 focus:border-blue-500 rounded-lg text-sm outline-none transition-all bg-transparent focus:bg-white font-medium text-gray-700" 
                        value={item.name} 
                        placeholder="Tên bài học cụ thể..." 
                        onChange={(e) => updateScopeItem(item.id, 'name', e.target.value)} 
                      />
                    </div>

                    <div className="col-span-1 md:col-span-1">
                       <label className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Số tiết</label>
                      <input 
                        type="number" 
                        className="w-full px-3 md:px-1 py-2 border-b border-gray-200 focus:border-blue-500 rounded-lg text-left md:text-center text-sm font-bold outline-none text-blue-800 bg-transparent focus:bg-white" 
                        value={item.periods || ''} 
                        onChange={(e) => updateScopeItem(item.id, 'periods', parseInt(e.target.value) || 0)} 
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-1 flex items-center justify-end md:justify-center space-x-1 mt-2 md:mt-0">
                      <button 
                        type="button" 
                        onClick={() => addScopeItemAt(idx)} 
                        title="Thêm bài học bên dưới" 
                        className="text-gray-400 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-all"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeScopeItem(item.id)} 
                        disabled={config.scopeItems.length <= 1}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-100 p-2 rounded-lg transition-all disabled:text-gray-200 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-center">
              <button type="button" onClick={() => addScopeItem(false)} className="w-full md:w-auto text-sm text-blue-800 font-bold bg-white border border-blue-200/80 hover:bg-blue-700 hover:text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-600/20">
                <PlusCircle size={18} /> Thêm Chương/Chủ đề mới
              </button>
              <div className="w-full md:w-auto text-sm font-bold text-slate-600 flex items-center justify-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-gray-200/80 shadow-sm">
                <Calculator size={20} className="text-blue-600" /> TỔNG SỐ TIẾT: <span className="text-blue-800 text-lg font-black">{totalPeriods}</span>
              </div>
            </div>
          </div>
        </div>

        {config.inputMode === 'upload' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
             <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex gap-4 text-amber-900 shadow-sm">
                <AlertCircle className="flex-shrink-0 text-amber-600" size={24} />
                <div className="text-sm">
                   <p className="font-black mb-1 uppercase tracking-tight">Hướng dẫn tải ma trận:</p>
                   <ul className="list-disc pl-5 space-y-1 font-medium italic text-xs">
                      <li>Hệ thống sẽ giữ nguyên ma trận 19 cột từ file Word của bạn.</li>
                      <li>AI sẽ sinh đề thi bám sát các đơn vị kiến thức trong file.</li>
                   </ul>
                </div>
             </div>
             <div className="border-4 border-dashed border-gray-200 rounded-[3rem] p-8 md:p-12 flex flex-col items-center justify-center gap-6 hover:bg-blue-50/50 hover:border-blue-500 transition-all cursor-pointer group bg-white shadow-inner"
               onClick={() => fileInputRef.current?.click()}>
                <div className="p-6 bg-blue-100 rounded-3xl text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-all shadow-xl shadow-sky-500/10">
                   <Upload size={48} />
                </div>
                <div className="text-center">
                   <p className="font-black text-gray-700 text-lg md:text-2xl group-hover:text-blue-800 transition-colors">{fileName || "Tải Ma trận chuẩn (.docx)"}</p>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-3">Kéo thả hoặc nhấp để chọn file</p>
                </div>
                <input type="file" accept=".docx" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
             </div>
             
             {uploadStatus.status !== 'idle' && (
                <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                    uploadStatus.status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    uploadStatus.status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                    'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                    {uploadStatus.status === 'success' && <CheckCircle size={20} />}
                    {uploadStatus.status === 'error' && <AlertCircle size={20} />}
                    {uploadStatus.status === 'loading' && <Loader2 size={20} className="animate-spin" />}
                    <span>{uploadStatus.message}</span>
                </div>
            )}
          </div>
        )}

        <button type="submit" disabled={isLoading} className={`w-full py-5 md:py-6 rounded-[2.5rem] text-white font-black text-lg md:text-xl shadow-2xl flex items-center justify-center gap-6 transition-all duration-500 hover:translate-y-[-4px] active:scale-[0.98] ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:shadow-2xl hover:shadow-blue-600/40 uppercase tracking-widest'}`}>
          {isLoading ? (
            <>
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
              <span>HỆ THỐNG ĐANG KHỞI TẠO...</span>
            </>
          ) : (
            <>
              <span>KHỞI TẠO HỒ SƠ 7991</span>
              <Sparkles size={28} className="text-blue-200 animate-pulse" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExamForm;