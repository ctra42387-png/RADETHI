
import React from 'react';
import { X, Settings, Bot, FileText, Download, Sparkles, PlusCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GuideStep = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:bg-white transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Icon size={32} />
        </div>
        <h4 className="text-lg font-black text-slate-800 mb-2">{title}</h4>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {children}
        </p>
    </div>
);

const Guide: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" role="dialog" aria-modal="true">
        <div 
            className="fixed inset-0" 
            aria-hidden="true" 
            onClick={onClose}
        ></div>
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border-2 border-white/50 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-8 py-5 border-b flex items-center justify-between bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Sparkles size={24} className="text-blue-700"/>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Hướng Dẫn Sử Dụng Nhanh</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">4 BƯỚC ĐỂ CÓ BỘ HỒ SƠ HOÀN CHỈNH</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FIX: The GuideStep component was missing the required 'children' prop. This was fixed by adding content between the component tags. */}
                    <GuideStep icon={Settings} title="Bước 1: Thiết lập Hồ sơ">
                        Cung cấp các thông tin cơ bản như Môn, Lớp, bộ Sách giáo khoa, phạm vi kiến thức và cấu trúc số lượng câu hỏi mong muốn.
                    </GuideStep>
                    {/* FIX: The GuideStep component was missing the required 'children' prop. This was fixed by adding content between the component tags. */}
                    <GuideStep icon={Bot} title="Bước 2: AI Khởi tạo">
                        Nhấn nút "Khởi tạo". Trí tuệ nhân tạo sẽ phân tích yêu cầu, tính toán, và tạo ra bộ hồ sơ 7991 đầy đủ chỉ trong vài giây.
                    </GuideStep>
                    {/* FIX: The GuideStep component was missing the required 'children' prop. This was fixed by adding content between the component tags. */}
                    <GuideStep icon={FileText} title="Bước 3: Xem & Tinh chỉnh">
                        Xem chi tiết Ma trận, Bản đặc tả, Đề thi và Đáp án. Bạn có thể sao chép, in ấn hoặc xuất ra file Word, PDF để sử dụng.
                    </GuideStep>
                    {/* FIX: The GuideStep component was missing the required 'children' prop. This was fixed by adding content between the component tags. */}
                    <GuideStep icon={PlusCircle} title="Bước 4: Tính năng Phụ trợ">
                        Sử dụng Trợ lý AI để hỏi đáp chuyên môn hoặc bấm "Lưu trữ" để quản lý các bộ hồ sơ đã tạo một cách khoa học.
                    </GuideStep>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-slate-50/50 flex justify-end">
                <button onClick={onClose} className="px-10 py-3 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm uppercase tracking-widest">
                    Đã hiểu
                </button>
            </div>
        </div>
    </div>
  );
};

export default Guide;
