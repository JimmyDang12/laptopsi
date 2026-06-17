// Phân quyền nhân viên — định nghĩa các công tắc tính năng

export const PERMISSION_DEFS = [
  { key: 'products', label: 'Quản lý sản phẩm', desc: 'Truy cập tab Sản phẩm: thêm/sửa/bán/sửa chữa' },
  { key: 'orders', label: 'Xem đơn hàng', desc: 'Truy cập tab Đơn hàng' },
  { key: 'orders_all', label: 'Xem đơn của mọi nhân viên', desc: 'Tắt = chỉ thấy đơn do mình tạo / phụ trách' },
  { key: 'customers', label: 'Xem khách hàng', desc: 'Truy cập tab Khách hàng' },
  { key: 'customers_all', label: 'Xem khách của mọi nhân viên', desc: 'Tắt = chỉ thấy khách do mình tạo' },
  { key: 'staff', label: 'Quản lý nhân viên', desc: 'Truy cập tab Nhân viên (nên dành cho quản lý)' },
]

// Mặc định cho nhân viên mới: bán hàng được, nhưng chỉ thấy đơn/khách của mình
export const DEFAULT_PERMISSIONS = {
  products: true,
  orders: true,
  orders_all: false,
  customers: true,
  customers_all: false,
  staff: false,
}

// Chủ cửa hàng: toàn quyền
export const OWNER_PERMISSIONS = {
  products: true,
  orders: true,
  orders_all: true,
  customers: true,
  customers_all: true,
  staff: true,
}

export function can(perms, key) {
  return !!(perms && perms[key])
}
