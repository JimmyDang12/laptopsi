// Trạng thái sản phẩm — nguồn dùng chung cho cả admin và trang khách

// Các trạng thái chọn được khi nhập/sửa sản phẩm (KHÔNG gồm "đã bán")
export const PRODUCT_STATUSES = [
  { key: 'con_hang', label: 'Còn hàng', color: '#22c55e' },
  { key: 'nguyen_trang', label: 'Nguyên trạng', color: '#14b8a6' },
  { key: 'cho_xu_ly', label: 'Chờ xử lý', color: '#f59e0b' },
  { key: 'dang_spa', label: 'Đang spa', color: '#8b5cf6' },
  { key: 'dang_sua', label: 'Đang sửa', color: '#3b82f6' },
]

// Nhãn + màu cho tất cả trạng thái (gồm đã bán & legacy đang về)
export const STATUS_LABELS = {
  con_hang: 'Còn hàng',
  nguyen_trang: 'Nguyên trạng',
  cho_xu_ly: 'Chờ xử lý',
  dang_spa: 'Đang spa',
  dang_sua: 'Đang sửa',
  da_ban: 'Đã bán',
  dang_ve: 'Đang về',
}
export const STATUS_COLORS = {
  con_hang: '#22c55e',
  nguyen_trang: '#14b8a6',
  cho_xu_ly: '#f59e0b',
  dang_spa: '#8b5cf6',
  dang_sua: '#3b82f6',
  da_ban: '#ef4444',
  dang_ve: '#f59e0b',
}

// Trạng thái thuộc nhóm "Cần xử lý" (gồm legacy dang_ve)
const PROCESSING = new Set(['cho_xu_ly', 'dang_spa', 'dang_sua', 'dang_ve'])

// 3 tab phân nhóm trong mục Sản phẩm (admin)
export const PRODUCT_TABS = [
  { key: 'dang_ban', label: '🟢 Đang bán' },
  { key: 'can_xu_ly', label: '🔧 Cần xử lý' },
  { key: 'da_ban', label: '🔴 Đã bán' },
]

export function statusLabel(status) {
  return STATUS_LABELS[status] || 'Còn hàng'
}
export function statusColor(status) {
  return STATUS_COLORS[status] || '#22c55e'
}

// Tab admin của một trạng thái. Mặc định (null/rỗng/lạ) -> đang bán
export function adminTab(status) {
  if (status === 'da_ban') return 'da_ban'
  if (PROCESSING.has(status)) return 'can_xu_ly'
  return 'dang_ban'
}

// Có được bán không (chỉ nhóm đang bán)
export function isSellable(status) {
  return adminTab(status) === 'dang_ban'
}

// Khách có thấy không (ẩn đã bán + nhóm cần xử lý)
export function isCustomerVisible(status) {
  return status !== 'da_ban' && !PROCESSING.has(status)
}

// Chuẩn hoá giá trị trạng thái từ file Excel (chấp nhận cả nhãn tiếng Việt, không dấu, hoa/thường)
const STATUS_ALIASES = {
  'con hang': 'con_hang', 'conhang': 'con_hang',
  'nguyen trang': 'nguyen_trang', 'nguyentrang': 'nguyen_trang', 'nguyen ban': 'nguyen_trang',
  'cho xu ly': 'cho_xu_ly', 'choxuly': 'cho_xu_ly',
  'dang spa': 'dang_spa', 'spa': 'dang_spa',
  'dang sua': 'dang_sua', 'sua': 'dang_sua', 'dang sua chua': 'dang_sua',
  'da ban': 'da_ban', 'daban': 'da_ban',
  'dang ve': 'cho_xu_ly', 'dangve': 'cho_xu_ly',
}
export function normalizeStatus(input) {
  if (!input) return 'con_hang'
  const raw = String(input).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\u0111/g, 'd').trim().replace(/\s+/g, ' ')
  if (STATUS_LABELS[raw]) return raw // đã là key hợp lệ (con_hang, nguyen_trang...)
  return STATUS_ALIASES[raw] || 'con_hang'
}
