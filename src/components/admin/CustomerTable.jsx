import './CustomerTable.css'

export default function CustomerTable({ customers, onViewCustomer }) {
  function formatDate(str) {
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function formatCurrency(num) {
    return new Intl.NumberFormat('vi-VN').format(num) + '₫'
  }

  if (customers.length === 0) return (
    <div className="table-empty">Chưa có khách hàng nào.</div>
  )

  return (
    <div className="table-wrap">
      <table className="customer-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên khách</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Địa chỉ</th>
            <th>Số đơn</th>
            <th>Tổng chi</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={c.id}>
              <td className="customer-id">#{customers.length - i}</td>
              <td className="customer-name clickable" onClick={() => onViewCustomer && onViewCustomer(c)}>{c.name}</td>
              <td><a href={`tel:${c.phone}`} className="customer-phone">{c.phone}</a></td>
              <td className="customer-email">{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '—'}</td>
              <td className="customer-address">{c.address || '—'}</td>
              <td className="customer-orders">{c.total_orders || 0}</td>
              <td className="customer-spent">{formatCurrency(c.total_spent || 0)}</td>
              <td className="customer-date">{formatDate(c.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
