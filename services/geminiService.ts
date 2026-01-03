import { GoogleGenAI, Type } from "@google/genai";
import { ExamConfig, GeneratedExamData } from "../types";

// Sử dụng model có khả năng suy luận tốt để tính toán số liệu bảng
// FIX: Updated to a recommended model for complex reasoning and compatibility with thinkingConfig.
const EXAM_GENERATION_MODEL_NAME = 'gemini-3-pro-preview'; 
const ASSISTANT_MODEL_NAME = 'gemini-3-pro-preview';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(ai: GoogleGenAI, params: any, retries = 3, baseDelay = 4000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const isRateLimit = error.code === 429 || 
                          error.status === 429 || 
                          error.status === 'RESOURCE_EXHAUSTED';
      const isServerOverload = error.code === 503 || error.status === 503;

      if (i < retries - 1 && (isRateLimit || isServerOverload)) {
         const delay = baseDelay * Math.pow(2, i);
         console.warn(`Gemini API busy/quota exceeded (Attempt ${i+1}/${retries}). Retrying in ${delay}ms...`);
         await sleep(delay);
         continue;
      }
      throw error;
    }
  }
}

export const getAIAssistantResponse = async (question: string, context: ExamConfig): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
        Bạn là một trợ lý AI chuyên gia về giáo dục và khảo thí tại Việt Nam, đặc biệt am hiểu về Công văn 7991. 
        Nhiệm vụ của bạn là hỗ trợ giáo viên trong quá trình tạo đề kiểm tra. 
        Hãy sử dụng "Ngữ cảnh đề bài hiện tại" được cung cấp để đưa ra câu trả lời ngắn gọn, chính xác và phù hợp nhất.
        Luôn trả lời bằng tiếng Việt.
    `;

    const userPrompt = `
      --- NGỮ CẢNH ĐỀ BÀI HIỆN TẠI ---
      ${JSON.stringify(context, null, 2)}
      ---------------------------------

      Câu hỏi của giáo viên: "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: ASSISTANT_MODEL_NAME,
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.5,
            }
        });

        if (!response.text) {
            return "Xin lỗi, tôi chưa thể đưa ra câu trả lời lúc này. Vui lòng thử lại sau.";
        }
        return response.text;
    } catch (error) {
        console.error("AI Assistant Error:", error);
        throw new Error("Không thể kết nối tới trợ lý AI.");
    }
};

export const generateExamContent = async (config: ExamConfig): Promise<GeneratedExamData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const scopeDetails = config.scopeItems.map((item, index) => {
    return `- Chương/Chủ đề: "${item.chapter}" | Bài học/Nội dung: "${item.name}" | Số tiết: ${item.periods}`;
  }).join('\n');

  // Định nghĩa cấu trúc Header chuẩn cho Ma trận (Phụ lục 1)
  const matrixHeaderHTML = `
  <thead>
    <tr>
      <th rowspan='4'>TT</th>
      <th rowspan='4'>Chương/<br/>Chủ đề</th>
      <th rowspan='4'>Nội dung/<br/>Đơn vị kiến thức</th>
      <th colspan='12'>Mức độ đánh giá</th>
      <th colspan='2'>Tổng số câu</th>
      <th rowspan='4'>%<br/>điểm</th>
    </tr>
    <tr>
      <th colspan='9'>Trắc nghiệm (TNKQ)</th>
      <th colspan='3'>Tự luận (TL)</th>
      <th rowspan='3'>TNKQ</th>
      <th rowspan='3'>TL</th>
    </tr>
    <tr>
      <th colspan='3'>Nhiều lựa chọn</th>
      <th colspan='3'>Đúng/Sai</th>
      <th colspan='3'>Trả lời ngắn</th>
      <th rowspan='2'>Biết</th>
      <th rowspan='2'>Hiểu</th>
      <th rowspan='2'>Vận dụng</th>
    </tr>
    <tr>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
    </tr>
  </thead>`;

  // Định nghĩa cấu trúc Header chuẩn cho Đặc tả (Phụ lục 2)
  const specHeaderHTML = `
  <thead>
    <tr>
      <th rowspan='4'>TT</th>
      <th rowspan='4'>Chương/<br/>Chủ đề</th>
      <th rowspan='4'>Nội dung/<br/>Đơn vị kiến thức</th>
      <th rowspan='4' style='width:25%'>Mức độ đánh giá<br/>(Yêu cầu cần đạt)</th>
      <th colspan='12'>Số câu hỏi theo mức độ đánh giá</th>
    </tr>
    <tr>
      <th colspan='9'>Trắc nghiệm (TNKQ)</th>
      <th colspan='3'>Tự luận (TL)</th>
    </tr>
    <tr>
      <th colspan='3'>Nhiều lựa chọn</th>
      <th colspan='3'>Đúng/Sai</th>
      <th colspan='3'>Trả lời ngắn</th>
      <th rowspan='2'>Biết</th>
      <th rowspan='2'>Hiểu</th>
      <th rowspan='2'>Vận dụng</th>
    </tr>
    <tr>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
      <th>Biết</th><th>Hiểu</th><th>VD</th>
    </tr>
  </thead>`;

  let systemInstruction = `
    Bạn là Chuyên gia Khảo thí của Bộ GD&ĐT Việt Nam. Nhiệm vụ: Xây dựng hồ sơ kiểm tra định kì theo đúng mẫu Công văn 7991/BGDĐT-GDTrH.

    DỮ LIỆU ĐẦU VÀO:
    - Môn: ${config.subject}, Khối ${config.grade}, Bộ sách: ${Array.isArray(config.textbook) ? config.textbook.join(', ') : config.textbook}.
    - Thời gian: ${config.duration} phút.
    - Cấu trúc số lượng câu: Phần 1 (${config.questionCounts.part1} câu), Phần 2 (${config.questionCounts.part2} câu), Phần 3 (${config.questionCounts.part3} câu), Phần 4 (${config.questionCounts.part4} câu).
    - Tỉ lệ mức độ: Nhận biết ${config.levelDistribution.awareness}% - Thông hiểu ${config.levelDistribution.understanding}% - Vận dụng ${config.levelDistribution.application}%.

    YÊU CẦU 1: MA TRẬN (Phụ lục 1)
    - Trả về mã HTML <table> hoàn chỉnh.
    - BẮT BUỘC sử dụng cấu trúc <thead> sau đây (không được thay đổi): ${matrixHeaderHTML}
    - Phần <tbody>: Điền các dòng tương ứng với các "Nội dung/Đơn vị kiến thức".
    - Phân bổ số câu hỏi vào các ô (Biết, Hiểu, VD) của từng loại hình (Nhiều lựa chọn, Đúng/Sai, Trả lời ngắn, Tự luận) sao cho tổng cộng khớp với cấu trúc số lượng câu đã cho.
    - Dòng cuối cùng là "Tổng cộng".

    YÊU CẦU 2: BẢN ĐẶC TẢ (Phụ lục 2)
    - Trả về mã HTML <table> hoàn chỉnh.
    - BẮT BUỘC sử dụng cấu trúc <thead> sau đây (không được thay đổi): ${specHeaderHTML}
    - Cột "Mức độ đánh giá": Ghi rõ các động từ năng lực (Ví dụ: Nhận biết: Kể tên được...; Thông hiểu: Giải thích được...). KHÔNG được để trống.
    - Các ô trong lưới mức độ đánh giá (Biết, Hiểu, VD của từng loại hình): Ghi trực tiếp số thứ tự của câu hỏi tương ứng (ví dụ: C1, C5, C8). Tuyệt đối không ghi số lượng câu hỏi (n).

    YÊU CẦU 3: ĐỀ THI
    - Tạo đề thi mẫu định dạng Markdown.
    - **Chất lượng:** Nội dung câu hỏi phải độc nhất, chính xác, rõ ràng, không lặp lại, và phù hợp với mức độ nhận thức.
    - Đề thi chia rõ 4 phần: Phần I (Trắc nghiệm nhiều lựa chọn), Phần II (Trắc nghiệm Đúng/Sai), Phần III (Trắc nghiệm Trả lời ngắn), Phần IV (Tự luận).
    - **QUY TẮC ĐỊNH DẠNG MARKDOWN (BẮT BUỘC TUÂN THỦ):**
      + Tiêu đề phần (PHẦN I, PHẦN II...) phải là heading cấp 2 (dùng \`##\`), IN HOA, và ghi rõ tổng điểm. Ví dụ: \`## PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN (3,0 điểm)\`.
      + Mỗi câu hỏi là một đoạn văn (paragraph) riêng.
      + Bắt đầu mỗi câu hỏi bằng \`**Câu X:**\` (in đậm, X là số thứ tự). Ví dụ: \`**Câu 1:** Cho tập hợp...\`
      + **QUAN TRỌNG (LATEX):** Mọi công thức toán học, ký hiệu khoa học (tập hợp, số mũ, phân số, v.v.) BẮT BUỘC phải được bao quanh bởi dấu \`$\` để hiển thị đúng định dạng LaTeX. Ví dụ: $x \\in \\mathbb{N}$, $A = \\{1, 2, 3\\}$, $2^3$, $a^2 + b^2 = c^2$. TUYỆT ĐỐI KHÔNG dùng ký tự unicode hoặc văn bản thường cho ký hiệu toán học.
      + **PHẦN I (Nhiều lựa chọn):** Trình bày các phương án A, B, C, D theo bố cục 2 cột, 2 hàng, sử dụng thẻ \`<br/>\` để xuống dòng giữa các hàng. Ví dụ:<br/>**A.** $P=\\{x \\in \\mathbb{N} | x<9\\}$ &emsp;&emsp; **B.** $P=\\{x \\in \\mathbb{N} | x \\le 9\\}$<br/>**C.** $P=\\{x \\in \\mathbb{N} | x>9\\}$ &emsp;&emsp; **D.** $P=\\{x \\in \\mathbb{N} | x \\ge 9\\}\`
      + **PHẦN II (Đúng/Sai):** BẮT BUỘC mỗi câu phải có một câu dẫn và 4 phát biểu a, b, c, d. **MỖI PHÁT BIỂU PHẢI XUỐNG DÒNG.** Ví dụ:<br/>**Câu 11:** Cho các số tự nhiên $A=2,024$, $B=2,042$, $C=1,999$ và tập hợp $S=\\{x \\in \\mathbb{N} | C < x < A\\}$.<br/>a) Số lớn nhất trong ba số A, B, C là 2,024.<br/>b) Số liền trước của số C là 2,000.<br/>c) Tập hợp S có chứa số 2,000.<br/>d) Viết số A dưới dạng La Mã là MMXXIV.

    YÊU CẦU 4: ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM
    - **TÍNH CHÍNH XÁC TUYỆT ĐỐI:** Đáp án phải được kiểm tra kỹ lưỡng để đảm bảo chính xác 100%. Đây là yêu cầu quan trọng nhất.
    - Trả về dưới dạng một chuỗi Markdown duy nhất, chia rõ các phần tương ứng với đề thi.
    - **Phần trắc nghiệm (I, II, III):** Cung cấp đáp án dưới dạng BẢNG (table) Markdown. Mỗi bảng gồm 2 cột: "Câu" và "Đáp án".
    - **ĐÁP ÁN PHẦN II (ĐÚNG/SAI):** Đối với mỗi câu, cột "Đáp án" phải liệt kê rõ đáp án (Đúng/Sai) cho cả 4 phát biểu a, b, c, d. Ví dụ: \`a-Sai, b-Đúng, c-Đúng, d-Sai\`.
    - **Phần tự luận (IV):** Cung cấp "HƯỚNG DẪN CHẤM CHI TIẾT" chứ không chỉ đưa ra kết quả. Phải phân bổ thang điểm chi tiết cho từng bước giải, từng ý. Tổng điểm của các ý phải bằng tổng điểm của câu đó. Ghi chú các cách giải khác (nếu có) và nguyên tắc làm tròn điểm.

    OUTPUT JSON FORMAT:
    {
      "matrix": "<table>...</table>",
      "specification": "<table>...</table>",
      "examPaper": "Markdown string...",
      "answers": "Markdown string..."
    }
  `;

  let userPrompt = `
    Hãy xây dựng hồ sơ dựa trên phạm vi kiến thức sau đây (Người dùng nhập thủ công):
    ${scopeDetails}
    
    Lưu ý quan trọng:
    1. Tính toán số liệu trong Ma trận phải logic, tổng số câu phải khớp với ${config.questionCounts.part1 + config.questionCounts.part2 + config.questionCounts.part3 + config.questionCounts.part4} câu.
    2. Nội dung Đặc tả phải bám sát Yêu cầu cần đạt của chương trình GDPT 2018 môn ${config.subject}.
  `;

  try {
    const response = await generateWithRetry(ai, {
      model: EXAM_GENERATION_MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4096 }, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matrix: { type: Type.STRING },
            specification: { type: Type.STRING },
            examPaper: { type: Type.STRING },
            answers: { type: Type.STRING },
          },
          required: ["matrix", "specification", "examPaper", "answers"],
        },
      },
    });

    if (!response.text) {
        throw new Error("Không nhận được dữ liệu từ AI.");
    }

    return JSON.parse(response.text.trim()) as GeneratedExamData;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};