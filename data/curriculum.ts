
// FIX: Removed local type definitions and imported from central types file.
import type { CurriculumChapter } from '../types.ts';

// Dữ liệu mở rộng GDPT 2018 (Tiếp tục bổ sung)
export const CURRICULUM_DATA: Record<string, Record<string, Record<string, CurriculumChapter[]>>> = {
  "Toán học": {
    "6": {
      "Kết nối tri thức với cuộc sống": [
        { 
          chapter: "Chương I: Tập hợp các số tự nhiên", 
          lessons: [{ name: "Bài 1: Tập hợp", defaultPeriods: 2 }, { name: "Bài 2: Cách ghi số tự nhiên", defaultPeriods: 1 }, { name: "Bài 3: Thứ tự trong tập hợp các số tự nhiên", defaultPeriods: 1 }, { name: "Bài 4: Phép cộng và phép trừ số tự nhiên", defaultPeriods: 2 }, { name: "Bài 5: Phép nhân và phép chia số tự nhiên", defaultPeriods: 2 }, { name: "Bài 6: Lũy thừa với số mũ tự nhiên", defaultPeriods: 2 }, { name: "Bài 7: Thứ tự thực hiện các phép tính", defaultPeriods: 1 }] 
        },
        { 
          chapter: "Chương II: Tính chia hết trong tập hợp các số tự nhiên", 
          lessons: [{ name: "Bài 8: Quan hệ chia hết và tính chất", defaultPeriods: 2 }, { name: "Bài 9: Dấu hiệu chia hết", defaultPeriods: 2 }, { name: "Bài 10: Số nguyên tố", defaultPeriods: 2 }, { name: "Bài 11: Ước chung. Ước chung lớn nhất", defaultPeriods: 3 }, { name: "Bài 12: Bội chung. Bội chung nhỏ nhất", defaultPeriods: 3 }] 
        },
        { 
          chapter: "Chương III: Số nguyên", 
          lessons: [{ name: "Bài 13: Tập hợp các số nguyên", defaultPeriods: 2 }, { name: "Bài 14: Phép cộng và phép trừ số nguyên", defaultPeriods: 3 }, { name: "Bài 15: Quy tắc dấu ngoặc", defaultPeriods: 1 }, { name: "Bài 16: Phép nhân số nguyên", defaultPeriods: 2 }, { name: "Bài 17: Phép chia hết. Ước và bội của một số nguyên", defaultPeriods: 1 }] 
        },
        { 
          chapter: "Chương IV: Một số hình phẳng trong thực tiễn", 
          lessons: [{ name: "Bài 18: Hình tam giác đều. Hình vuông. Hình lục giác đều", defaultPeriods: 2 }, { name: "Bài 19: Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân", defaultPeriods: 3 }, { name: "Bài 20: Chu vi và diện tích của một số tứ giác đã học", defaultPeriods: 2 }] 
        }
      ],
      "Cánh Diều": [
        { chapter: "Chương I: Số tự nhiên", lessons: [{name: "Bài 1: Tập hợp", defaultPeriods: 2}, {name: "Bài 2: Tập hợp các số tự nhiên", defaultPeriods: 2}, {name: "Bài 3: Phép cộng, phép trừ các số tự nhiên", defaultPeriods: 2}] }
      ]
    },
    "7": {
        "Kết nối tri thức với cuộc sống": [
            { chapter: "Chương I: Số hữu tỉ", lessons: [{name: "Bài 1: Tập hợp các số hữu tỉ"}, {name: "Bài 2: Cộng, trừ, nhân, chia số hữu tỉ"}, {name: "Bài 3: Lũy thừa của số hữu tỉ"}] }
        ]
    }
  },
  "Ngữ văn": {
    "6": {
      "Kết nối tri thức với cuộc sống": [
        { chapter: "Bài 1: Tôi và các bạn", lessons: [{name: "Đọc: Bài học đường đời đầu tiên"}, {name: "Đọc: Nếu cậu muốn có một người bạn..."}, {name: "Thực hành tiếng Việt: Từ đơn và từ phức"}] },
        { chapter: "Bài 2: Gõ cửa trái tim", lessons: [{name: "Đọc: Chuyện cổ tích về loài người"}, {name: "Đọc: Mây và sóng"}, {name: "Thực hành tiếng Việt: Ẩn dụ"}] }
      ]
    }
  },
  "Khoa học tự nhiên": {
    "6": {
      "Kết nối tri thức với cuộc sống": [
        { chapter: "Chương I: Mở đầu về KHTN", lessons: [{name: "Bài 1: Giới thiệu về Khoa học tự nhiên"}, {name: "Bài 2: An toàn trong phòng thực hành"}, {name: "Bài 3: Sử dụng kính lúp"}] },
        { chapter: "Chương II: Chất quanh ta", lessons: [{name: "Bài 9: Sự đa dạng của chất"}, {name: "Bài 10: Ba thể của chất và sự chuyển thể"}, {name: "Bài 11: Oxygen. Không khí"}] }
      ]
    }
  }
};
