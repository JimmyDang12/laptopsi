import './ProductTable.css'
const STATUS_MAP = { con_hang: { label: 'Còn hàng', color: '#22c55e' }, da_ban: { label: 'Đã bán', color: '#ef4444' }, dang_ve: { label: 'Đang về', color: '#f59e0b' } }

export default function ProductTable({ products, onEdit, onDelete }) {
  const formatPrice = p => p ? new Intl.NumberFormat('vi-VN').format(p) + '₫' : '—'
  if (products.length === 0) return <div className="table-empty">Chưa có sản phẩm nào. Bấm "+ Thêm sản phẩm" để bắt đầu.</div>
  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Cấu hình</th>
            <th>Giá bán</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const status = STATUS_MAP[p.status] || STATUS_MAP.con_hang
            return (
              <tr key={p.id}>
                <td>
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="table-img" />
                    : <div className="table-img-placeholder">💻</div>}
                </td>
                <td>
                  <p className="table-name">{p['Tên sản phẩm']}</p>
                  {p['Serial'] && <p className="table-serial">SN: {p['Serial']}</p>}
                </td>
                <td className="table-spec">{p['cấu hình'] || '—'}</td>
                <td className="table-price">{formatPrice(p['Giá bán'])}</td>
                <td><span className="status-dot" style={{ background: status.color }}>{status.label}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" onClick={() => onEdit(p)}>✏️ Sửa</button>
                    <button className="btn-delete" onClick={() => onDelete(p.id)}>🗑️ Xoá</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
