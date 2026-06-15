import { useState, useEffect, useRef, useMemo } from 'react'
import './NotificationBell.css'

const STORAGE_KEY = 'admin_seen_orders'

function loadSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export default function NotificationBell({ orders = [], onOpenOrders }) {
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(loadSeen)
  const ref = useRef(null)

  // Thông báo = đơn khách tự đặt (chờ xử lý)
  const pending = useMemo(
    () => orders.filter(o => o.status === 'pending'),
    [orders]
  )
  const unread = pending.filter(o => !seen.has(o.id))

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && pending.length) {
      // Mở dropdown -> đánh dấu đã đọc
      const merged = new Set(seen)
      pending.forEach(o => merged.add(o.id))
      setSeen(merged)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]))
    }
  }

  function formatDate(str) {
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="notif" ref={ref}>
      <button className="notif-bell" onClick={toggle} title="Thông báo">
        🔔
        {unread.length > 0 && <span className="notif-badge">{unread.length}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-head">
            <span>🔔 Thông báo</span>
            <span className="notif-count">{pending.length} chờ xử lý</span>
          </div>
          {pending.length === 0 ? (
            <div className="notif-empty">Không có đơn hàng mới</div>
          ) : (
            <div className="notif-list">
              {pending.slice(0, 15).map(o => (
                <div
                  key={o.id}
                  className="notif-item"
                  onClick={() => { setOpen(false); onOpenOrders && onOpenOrders() }}
                >
                  <div className="notif-item-top">
                    <span className="notif-product">🛒 {o.product_name || 'Sản phẩm'}</span>
                    <span className="notif-time">{formatDate(o.created_at)}</span>
                  </div>
                  <div className="notif-customer">{o.customer_name} · {o.customer_phone}</div>
                  {o.note && <div className="notif-note">{o.note}</div>}
                </div>
              ))}
            </div>
          )}
          {pending.length > 0 && (
            <button className="notif-viewall" onClick={() => { setOpen(false); onOpenOrders && onOpenOrders() }}>
              Xem tất cả đơn hàng →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
