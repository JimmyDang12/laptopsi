import './StatsBar.css'
export default function StatsBar({ stats }) {
  const items = [
    { label: 'Tổng sản phẩm', value: stats.total, color: '#378ADD' },
    { label: 'Còn hàng', value: stats.con_hang, color: '#22c55e' },
    { label: 'Đã bán', value: stats.da_ban, color: '#ef4444' },
    { label: 'Đang về', value: stats.dang_ve, color: '#f59e0b' },
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
