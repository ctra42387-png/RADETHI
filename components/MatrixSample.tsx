
import React, { useState } from 'react';
import { X, Info, CheckCircle, FileSpreadsheet, ListChecks, Sparkles, Plus } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const MatrixSample: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'spec'>('matrix');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[95vw] max-h-[95vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border-4 border-blue-700/10">
        
        {/* Header */}
        <div className="px-8 py-6 border-b flex items-center justify-between bg-blue-800 text-white">
          <div className="flex items-center gap-4">
            <Info size={24} />
            <div>
              <h3 className="text-xl font-black uppercase">Mẫu Chuẩn Phụ Lục Công Văn 7991 (17/12/2024)</h3>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1">Giao diện đối soát chuẩn Bộ GD&ĐT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          <div className="flex p-1 bg-gray-200 rounded-2xl w-fit mx-auto mb-8 font-black text-xs">
            <button onClick={() => setActiveTab('matrix')} className={`px-8 py-3 rounded-xl flex items-center gap-2 transition-all ${activeTab === 'matrix' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <FileSpreadsheet size={18} /> 1. Ma trận (Phụ lục 1)
            </button>
            <button onClick={() => setActiveTab('spec')} className={`px-8 py-3 rounded-xl flex items-center gap-2 transition-all ${activeTab === 'spec' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <ListChecks size={18} /> 2. Bản đặc tả (Phụ lục 2)
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 overflow-x-auto">
            <style>{`
              .sample-7791 table { border-collapse: collapse; width: 100%; border: 1.5px solid black; font-family: 'Times New Roman', serif; }
              .sample-7791 th, .sample-7791 td { border: 1px solid black; padding: 4px 2px; text-align: center; vertical-align: middle; font-size: 8.5pt; }
              .sample-7791 thead th { background-color: #f8fafc; font-weight: bold; }
              .sample-7791 .text-left { text-align: left !important; padding-left: 8px !important; }
              .sample-7791 .font-bold { font-weight: bold; }
            `}</style>
            
            <div className="sample-7791">
              {activeTab === 'matrix' ? (
                <>
                  <h4 className="text-center font-bold mb-4">1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ (19 CỘT)</h4>
                  <table>
                    <thead>
                      <tr>
                        <th rowSpan={4}>TT</th>
                        <th rowSpan={4}>Chủ đề/Chương</th>
                        <th rowSpan={4}>Nội dung/đơn vị kiến thức</th>
                        <th colSpan={12}>Mức độ đánh giá</th>
                        <th colSpan={3}>Tổng</th>
                        <th rowSpan={4}>Tỉ lệ % điểm</th>
                      </tr>
                      <tr>
                        <th colSpan={9}>TNKQ</th>
                        <th colSpan={3}>Tự luận</th>
                        <th rowSpan={3}>Biết</th>
                        <th rowSpan={3}>Hiểu</th>
                        <th rowSpan={3}>Vận dụng</th>
                      </tr>
                      <tr>
                        <th colSpan={3}>Nhiều lựa chọn</th>
                        <th colSpan={3}>"Đúng - Sai"</th>
                        <th colSpan={3}>Trả lời ngắn</th>
                        <th rowSpan={2}>Biết</th>
                        <th rowSpan={2}>Hiểu</th>
                        <th rowSpan={2}>Vận dụng</th>
                      </tr>
                      <tr>
                        <th>Biết</th><th>Hiểu</th><th>VD</th>
                        <th>Biết</th><th>Hiểu</th><th>VD</th>
                        <th>Biết</th><th>Hiểu</th><th>VD</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td className="font-bold">Chủ đề 1</td>
                        <td className="text-left">Nội dung 1.1</td>
                        <td>(n)</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>1</td><td>0</td><td>0</td><td>10%</td>
                      </tr>
                      <tr className="font-bold">
                        <td colSpan={3}>Tổng số câu</td>
                        <td>12</td><td>0</td><td>0</td><td>4</td><td>0</td><td>0</td><td>4</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>12</td><td>4</td><td>3</td><td></td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <h4 className="text-center font-bold mb-4 text-sm uppercase">2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ (CHỈNH SỬA CHUẨN 7991)</h4>
                  <table>
                    <thead>
                      <tr>
                        <th rowSpan={4}>TT</th>
                        <th rowSpan={4}>Chủ đề/Chương</th>
                        <th rowSpan={4}>Nội dung/đơn vị kiến thức</th>
                        <th rowSpan={4} className="w-64">Yêu cầu cần đạt</th>
                        <th colSpan={12}>Số câu hỏi ở các mức độ đánh giá</th>
                      </tr>
                      <tr>
                        <th colSpan={9}>TNKQ</th>
                        <th colSpan={3}>Tự luận</th>
                      </tr>
                      <tr>
                        <th colSpan={3}>Nhiều lựa chọn</th>
                        <th colSpan={3}>"Đúng - Sai"</th>
                        <th colSpan={3}>Trả lời ngắn</th>
                        <th rowSpan={2}>Biết</th>
                        <th rowSpan={2}>Hiểu</th>
                        <th rowSpan={2}>VD</th>
                      </tr>
                      <tr>
                        <th>Biết</th><th>Hiểu</th><th>VD</th>
                        <th>Biết</th><th>Hiểu</th><th>VD</th>
                        <th>Biết</th><th>Hiểu</th><th>VD</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td className="font-bold">Chủ đề 1</td>
                        <td className="text-left">Nội dung 1.1</td>
                        <td className="text-left">
                          - <b>Nhận biết:</b> ... <br/>
                          - <b>Thông hiểu:</b> ... <br/>
                          - <b>Vận dụng:</b> ...
                        </td>
                        <td className="font-bold">C1, C2</td><td>-</td><td>-</td><td className="font-bold">C15</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td className="font-bold">C1a</td><td>-</td>
                      </tr>
                      <tr className="font-bold bg-gray-50">
                        <td colSpan={4}>Tổng số câu</td>
                        <td>12</td><td>0</td><td>0</td><td>4</td><td>0</td><td>0</td><td>4</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td>
                      </tr>
                      <tr className="font-bold">
                        <td colSpan={4}>Tổng số điểm</td>
                        <td>3,0</td><td>-</td><td>-</td><td>2,0</td><td>-</td><td>-</td><td>2,0</td><td>-</td><td>-</td><td>3,0</td><td>-</td><td>-</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
            <Sparkles className="text-blue-700 flex-shrink-0" size={24} />
            <div className="text-xs text-blue-950">
              <p className="font-bold uppercase mb-1">Cải tiến mới:</p>
              <p>Hệ thống AI hiện đã hỗ trợ sinh bản Đặc tả với cột <b>Yêu cầu cần đạt</b> chi tiết, tự động điền mã câu hỏi (C1, C2...) vào đúng ô năng lực theo Phụ lục 2 của Công văn 7991 mới nhất.</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-end">
          <button onClick={onClose} className="px-8 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-lg shadow-lg transition-all uppercase text-xs tracking-widest">
            Đóng mẫu đối soát
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatrixSample;