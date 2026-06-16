import './OrderTable.css'

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b' },
  confirmed: { label: 'Đã xác nhận', color: '#22c55e' },
  cancelled: { label: 'Đã huỷ', color: '#ef4444' },
}

export default function OrderTable({ orders, onUpdateStatus, staff = [], onAssignStaff }) {
  function formatDate(str) {
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (orders.length === 0) return (
    <div className="order-empty">Chưa có đơn hàng nào.</div>
  )

  return (
    <div className="table-wrap">
      <table className="order-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sản phẩm</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Ghi chú</th>
            <th>Nhân viên</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => {
            const status = STATUS_MAP[o.status] || STATUS_MAP.pending
            return (
              <tr key={o.id}>
                <td className="order-id">#{orders.length - i}</td>
                <td className="order-product">{o.product_name || '—'}</td>
                <td className="order-customer">{o.customer_name}</td>
                <td><a href={`tel:${o.customer_phone}`} className="order-phone">{o.customer_phone}</a></td>
                <td className="order-note">{o.note || '—'}</td>
                <td>
                  <select
                    className="staff-select"
                    value={o.staff_id || ''}
                    onChange={e => onAssignStaff && onAssignStaff(o.id, e.target.value)}
                  >
                    <option value="">— Chưa gán —</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </td>
                <td className="order-date">{formatDate(o.created_at)}</td>
                <td><span className="order-status" style={{ background: status.color }}>{status.label}</span></td>
                <td>
                  <select className="status-select" value={o.status} onChange={e => onUpdateStatus(o.id, e.target.value)}>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Xác nhận</option>
                    <option value="cancelled">Huỷ</option>
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
