# CASE STUDY: EXCEL TOP-UP SPLITTER & DASHBOARD

**Role**: Lead Developer  
**Timeline**: 2026 (Version 1.1)  
**Live Demo**: `[Your-Vercel-Link]/demo`  
**Source Code**: `github.com/phamdongdien19/Excel-Top-up-Splitter_demo`

---

## 1. Executive Summary
Xây dựng một ứng dụng web hiệu năng cao nhằm tự động hóa quy trình hậu cần (logistics) trong ngành Nghiên cứu thị trường. Công cụ giải quyết bài toán xử lý hàng ngàn dòng dữ liệu khảo sát (Top-up data) để phân phối quà tặng (evouchers) và quản lý chi phí đối tác cung cấp mẫu.

## 2. The Problem
Trước khi có công cụ này, quy trình xử lý dữ liệu hoàn toàn thủ công:
*   **Mất thời gian**: Nhân viên phải lọc và tách file Excel hàng giờ đồng hồ cho mỗi dự án.
*   **Rủi ro sai sót**: Việc copy-paste thủ công dễ dẫn đến sai số trong số tiền thưởng hoặc nhầm lẫn thông tin người nhận.
*   **Thiếu minh bạch chi phí**: Khó khăn trong việc theo dõi ngân sách thực tế so với dự kiến, đặc biệt khi làm việc với nhiều vendor nước ngoài (đa tỉ giá).

## 3. The Solution
Một giải pháp Full-stack (Client-side) tối ưu với các tính năng:
*   **Automated Data Splitting**: Tự động nhận diện và tách dữ liệu thành các file riêng biệt theo Vendor, Referrer, và Internal Panel chỉ bằng một thao tác kéo thả.
*   **Real-time Cost Engine**: Hệ thống tính toán chi phí thông minh, hỗ trợ đa ngoại tệ (USD/VND) và phí dịch vụ bổ sung (SMS/Email).
*   **Budget Forecasting & Sampling Optimization**: Công cụ cho phép ước tính chi phí tích lũy từ tất cả các nguồn theo thời gian thực. Điều này giúp dự báo ngân sách còn lại chính xác, từ đó đưa ra quyết định phân bổ số lượng mẫu (sample) còn thiếu cho các nguồn (vendors) một cách hợp lý và tiết kiệm nhất.
*   **Interactive Analytics**: Dashboard trực quan hóa cơ cấu mẫu (Sampling) và tỷ trọng ngân sách thông qua biểu đồ sinh động.
*   **Project History**: Tích hợp local storage để quản lý và truy xuất lịch sử dự án ngay lập tức.

## 4. Technical Excellence
*   **Modern Stack**: 
    *   **Frontend**: Next.js 15, React 19 (Hooks & Functional Components).
    *   **Styling**: Tailwind CSS 4 (đảm bảo UI hiện đại, responsive).
*   **Data Processing**:
    *   `xlsx` & `jszip`: Xử lý mảng dữ liệu lớn và nén file trực tiếp trên trình duyệt (Zero-server latency).
    *   `TypeScript`: Đảm bảo tính nhất quán của dữ liệu và hạn chế lỗi runtime.
*   **Visualization**: `recharts` cho các biểu đồ phân tích sâu.

## 5. Business Impact
*   **Efficiency**: Giảm **95% thời gian** xử lý dữ liệu (từ 1 giờ xuống còn dưới 10 giây).
*   **Accuracy**: Loại bỏ hoàn toàn lỗi con người trong việc phân phối incentive và tính toán công nợ vendor.
*   **Strategic Decision Support**: Giúp Project Manager chủ động cân đối ngân sách trong suốt quá trình chạy dự án (Fieldwork), thay vì đợi đến khi kết thúc mới tổng kết chi phí.
*   **User Experience**: Giao diện đạt chuẩn "Premium", giúp người dùng dễ dàng thao tác mà không cần hướng dẫn phức tạp.

---
*Báo cáo này được tạo để minh chứng năng lực tư duy kiến trúc hệ thống và kỹ năng lập trình hiện đại.*
