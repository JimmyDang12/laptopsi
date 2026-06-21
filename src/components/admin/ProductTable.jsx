import './ProductTable.css'
import { statusLabel, statusColor, isSellable, adminTab } from '../../lib/productStatus'

export default function ProductTable({ products, onEdit, onDelete, onView, onSell, onRefund, onRepair, ordersByProduct = {} }) {
  const formatPrice = p => p ? new Intl.NumberFormat('vi-VN').format(p) + '₫' : '—'
  if (products.length === 0) return <div className="table-empty">Không có sản phẩm nào.</div>
  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Cấu hình</th>
            <th>Ghi chú</th>
            <th>Giá bán</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const buyer = p.status === 'da_ban' ? ordersByProduct[p.id] : null
            const inProcessing = adminTab(p.status) === 'can_xu_ly'
            return (
              <tr key={p.id}>
                <td>
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="table-img" onClick={() => onView && onView(p)} />
                    : <div className="table-img-placeholder" onClick={() => onView && onView(p)}>💻</div>}
                </td>
                <td>
                  <p className="table-name clickable" onClick={() => onView && onView(p)}>{p['Tên sản phẩm']}</p>
                  {p['Serial'] && <p className="table-serial">SN: {p['Serial']}</p>}
                </td>
                <td className="table-spec">{p['cấu hình'] || '—'}</td>
                <td className="table-note">{p['Ghi chú'] || '—'}</td>
                <td className="table-price">{formatPrice(p['Giá bán'])}</td>
                <td>
                  <span className="status-dot" style={{ background: statusColor(p.status) }}>{statusLabel(p.status)}</span>
                  {buyer && (
                    <p className="table-buyer">👤 {buyer.customer_name || 'Khách'}{buyer.customer_phone ? ` · ${buyer.customer_phone}` : ''}</p>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    {isSellable(p.status) && onSell && (
                      <button className="btn-sell" onClick={() => onSell(p)}>💰 Bán</button>
                    )}
                    {inProcessing && onRepair && (
                      <button className="btn-repair" onClick={() => onRepair(p)}>🔧 Sửa chữa</button>
                    )}
                    {p.status === 'da_ban' && onRefund && (
                      <button className="btn-refund" onClick={() => onRefund(p)}>↩️ Trả hàng</button>
                    )}
                    <button className="btn-edit" onClick={() => onEdit(p)}>✏️ Sửa</button>
                    {p.status !== 'da_ban' && (
                      <button className="btn-delete" onClick={() => onDelete(p.id)}>🗑️ Xoá</button>
                    )}
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
