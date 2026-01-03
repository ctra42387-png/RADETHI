<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Trợ Lý Ra Đề Kiểm Tra CV 7991

Ứng dụng AI hỗ trợ giáo viên xây dựng Ma trận, Bản đặc tả và Đề kiểm tra bám sát chương trình GDPT 2018 và Công văn 7991.

Xem ứng dụng của bạn trong AI Studio: https://ai.studio/apps/drive/18aCQRPWk6DWQh20NG7nUseqGEsTgt7Zm

---

## Chạy ứng dụng tại Local

**Yêu cầu:** Đã cài đặt [Node.js](https://nodejs.org/).

1.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    ```
2.  **Thiết lập API Key:**
    Tạo một file tên là `.env` ở thư mục gốc của dự án và thêm vào đó `GEMINI_API_KEY` của bạn.
    ```
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
3.  **Chạy ứng dụng:**
    ```bash
    npm run dev
    ```
    Ứng dụng sẽ có thể truy cập tại `http://localhost:3000`.

---

## Triển khai với Vercel

Bạn có thể triển khai ứng dụng này lên Vercel một cách dễ dàng.

1.  **Đẩy mã nguồn lên Git:**
    Đảm bảo mã nguồn của bạn đã được đẩy lên một repository trên GitHub, GitLab, hoặc Bitbucket.

2.  **Tạo dự án trên Vercel:**
    - Đăng nhập vào tài khoản Vercel của bạn.
    - Nhấn "Add New... -> Project".
    - Chọn "Import" repository Git của bạn.

3.  **Cấu hình Biến Môi trường:**
    - Trong phần cài đặt của dự án trên Vercel, đi đến mục "Settings" -> "Environment Variables".
    - Thêm một biến môi trường mới:
      - **Name:** `GEMINI_API_KEY`
      - **Value:** Dán khóa API Gemini của bạn vào đây.

4.  **Triển khai:**
    - Vercel sẽ tự động nhận diện đây là một dự án Vite và cấu hình các thiết lập build một cách chính xác.
    - Nhấn nút "Deploy". Sau vài phút, ứng dụng của bạn sẽ được triển khai và có một đường dẫn công khai.
