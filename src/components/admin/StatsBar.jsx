import './StatsBar.css'
export default function StatsBar({ stats }) {
  const items = [
    { label: 'Tổng sản phẩm', value: stats.total, color: '#378ADD' },
    { label: 'Đang bán', value: stats.dang_ban, color: '#22c55e' },
    { label: 'Cần xử lý', value: stats.can_xu_ly, color: '#f59e0b' },
    { label: 'Đã bán', value: stats.da_ban, color: '#ef4444' },
  ]
  return (
    <div className="stats-bar">
      {items.map(item => (
        <div key={item.label} className="stat-card">
          <p className="stat-value" style={{ color: item.color }}>{item.value}</p>
          <p className="stat-label">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
