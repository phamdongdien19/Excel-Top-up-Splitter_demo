# Excel Top-up Splitter 🚀

Công cụ hỗ trợ tách và xử lý dữ liệu Top-up từ file Excel xuất ra từ các nền tảng khảo sát (như Alchemer). 

## 🌟 Tính năng chính
- **Xử lý tự động**: Tự động phân loại respondents theo nguồn (Panel IFM, Zalo Group, Referrers, Vendors).
- **Tính toán chi phí**: Ước tính chi phí survey, tiền thưởng (evoucher) và chi phí cho các đối tác cung cấp mẫu (Vendors) theo tỉ giá hối đoái thực tế.
- **Xuất dữ liệu thông minh**: 
  - Tự động tách thành các file Excel riêng biệt theo từng Vendor.
  - Tạo file CSV Merged cho hệ thống GotIt.
  - Tạo file Text/XLSX cho các nền tảng đặc thù như Fulcrum.
- **Hệ thống Dashboard**: Giao diện trực quan với các biểu đồ phân bổ mẫu và biểu đồ cơ cấu ngân sách.
- **Lịch sử dự án**: Lưu trữ cấu hình và kết quả của các dự án trước đó vào bộ nhớ trình duyệt.

## 📊 Live Interactive Demo
Bạn có thể xem trước giao diện và tính năng của ứng dụng với dữ liệu mẫu (Dummy Data) tại:
**`[Link-Vercel-Của-Bạn]/demo`**

*(Lưu ý: Trang demo sử dụng dữ liệu tĩnh để minh họa khả năng báo cáo và UI/UX của hệ thống)*

## 🛠 Công nghệ sử dụng
- **Frontend**: Next.js 15+, React 19, Tailwind CSS 4.
- **Thư viện chính**:
  - `xlsx`: Xử lý đọc/ghi file Excel.
  - `jszip`: Nén các file đã xử lý thành gói ZIP.
  - `recharts`: Hiển thị biểu đồ thống kê.
  - `lucide-react`: Hệ thống icon tối giản.

## 🚀 Hướng dẫn cài đặt (Local Development)

1. **Clone repository**:
   ```bash
   git clone https://github.com/phamdongdien19/Excel-Top-up-Splitter_demo.git
   cd Excel-Top-up-Splitter_demo
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Chạy môi trường phát triển**:
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt**:
   Truy cập `http://localhost:3000` để xem ứng dụng gốc, hoặc `http://localhost:3000/demo` để xem bản demo.

---
© 2026 - Phát triển bởi **Phạm Đông Điền**
