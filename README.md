# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Admin: Xem chi tiết sản phẩm

- **Hành vi:** Trong trang Admin, bấm vào ảnh hoặc tên sản phẩm sẽ mở popup chi tiết sản phẩm (modal) tương tự như trang Home.
- **Vị trí mã:** logic được xử lý ở `src/pages/Admin/index.jsx` (hàm `openDetail`) và giao diện clickable ở `src/components/admin/ProductTable.jsx`.
- **Component hiển thị:** popup chi tiết là `src/components/ProductDetail.jsx`; popup đặt hàng là `src/components/OrderModal.jsx`.
- **Dữ liệu ảnh:** khi mở chi tiết, hệ thống sẽ truy vấn bảng `product_images` (Supabase) để lấy ảnh theo `product_id`.
- **Quyền truy cập:** trang Admin yêu cầu đăng nhập và quyền admin (xem `src/context/AuthContext.jsx` để hiểu xác thực).

Ghi chú: mục này mô tả hành vi hiện có dựa trên mã nguồn — cập nhật nếu bạn thay đổi cách fetch ảnh hoặc modal.
