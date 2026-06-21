# Project: Laptopsi

## Tech Stack
- React + Vite
- Supabase (authentication + database)
- Deployed on Vercel

## Cấu trúc thư mục
- /src/components/admin/ - Các modal và table quản lý (Customer, Product, Order, Repair, Staff...)
- /src/components/ - Shared components (Navbar, Auth, OrderModal, ProductCard...)
- /src/assets/ - Hình ảnh

## Quy tắc code
- Mỗi tính năng gồm: TênModal.jsx + TênModal.css + TênTable.jsx + TênTable.css
- Supabase client import từ file cấu hình chung
- CSS viết riêng từng component, không dùng global

## Database (Supabase)
- customers - quản lý khách hàng
- products - quản lý sản phẩm
- orders - đơn hàng
- repairs - sửa chữa
- staff - nhân viên

## Lưu ý quan trọng
- Không đọc toàn bộ file CSS trừ khi được yêu cầu
- Chỉ đọc file liên quan đến tính năng đang làm
- Không scan toàn bộ project khi bắt đầu