import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'
import { normalizeStatus, statusLabel } from '../../lib/productStatus'
import './ImportExcel.css'

// Chuẩn hoá tên cột để khớp linh hoạt (bỏ dấu, hoa->thường, đ->d)
function normHeader(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').trim().replace(/\s+/g, ' ')
}

// Mỗi cột DB nhận nhiều tên cột Excel khác nhau (đã chuẩn hoá)
const FIELD_ALIASES = {
  'Tên sản phẩm': ['ten san pham', 'san pham', 'ten may', 'ten', 'name', 'product'],
  'Giá bán': ['gia ban', 'gia', 'price'],
  'Serial': ['serial', 'sn', 'so serial'],
  'Màu': ['mau', 'mau sac', 'color'],
  'Tình trạng pin': ['tinh trang pin', 'pin', 'battery'],
  'Ghi chú': ['ghi chu', 'note', 'notes'],
  'Ngoại hình': ['ngoai hinh', 'hinh thuc'],
  'cấu hình': ['cau hinh', 'config', 'configuration'],
  'image_url': ['image_url', 'image', 'anh', 'hinh anh', 'url'],
  'status': ['status', 'trang thai', 'tinh trang may'],
}

export default function ImportExcel({ onClose, onImported }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [fileName, setFileName] = useState('')

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
      // Map cột — khớp tên cột linh hoạt (không phân biệt hoa thường/dấu)
      const mapped = data.map(row => {
        // Lập bảng tra theo tên cột đã chuẩn hoá
        const normRow = {}
        for (const key of Object.keys(row)) {
          const v = row[key]
          if (v !== undefined && v !== '') normRow[normHeader(key)] = v
        }
        const product = {}
        for (const [dbCol, aliases] of Object.entries(FIELD_ALIASES)) {
          for (const alias of aliases) {
            if (normRow[alias] !== undefined) { product[dbCol] = normRow[alias]; break }
          }
        }
        if (product['Giá bán']) product['Giá bán'] = Number(String(product['Giá bán']).replace(/[^0-9]/g, '')) || null
        // Chuẩn hoá trạng thái: hiểu cả nhãn tiếng Việt ("Nguyên trạng", "Đang sửa"...)
        product.status = normalizeStatus(product.status)
        return product
      })
      setRows(mapped)
    }
    reader.readAsBinaryString(file)
  }

  async function handleImport() {
    if (!rows.length) return
    setLoading(true)
    const { data, error } = await supabase.from('products').insert(rows).select()
    if (error) {
      setResult({ success: false, message: 'Lỗi: ' + error.message })
    } else {
      setResult({ success: true, message: `✅ Đã thêm ${data.length} sản phẩm thành công!` })
    }
    setLoading(false)
  }

  function downloadTemplate() {
    const template = [
      {
        'Tên sản phẩm': 'Surface Pro 9',
        'Giá bán': 18500000,
        'Serial': 'SN123456',
        'Màu': 'Platinum',
        'Tình trạng pin': '99%',
        'Ngoại hình': 'Like New 99%',
        'Cấu hình': 'Intel Core i5, RAM 8GB, SSD 256GB',
        'Ghi chú': 'Máy kèm bút',
        'image_url': '',
        'status': 'con_hang',
      }
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sản phẩm')
    XLSX.writeFile(wb, 'mau_san_pham.xlsx')
  }

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-box" onClick={e => e.stopPropagation()}>
        <div className="import-header">
          <h2>📥 Import Excel</h2>
          <button className="import-close" onClick={onClose}>✕</button>
        </div>

        <div className="import-body">
          <button className="btn-template" onClick={downloadTemplate}>
            📄 Tải file mẫu Excel
          </button>

          <p className="import-status-help">
            Cột <strong>status</strong> nhận: <em>Còn hàng, Nguyên trạng, Chờ xử lý, Đang spa, Đang sửa</em> (hoặc bỏ trống = Còn hàng). Để trống thì máy mặc định là "Còn hàng".
          </p>

          <div className="import-upload">
            <label className="btn-choose-file">
              📁 {fileName || 'Chọn file Excel (.xlsx)'}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: 'none' }} />
            </label>
          </div>

          {rows.length > 0 && (
            <div className="import-preview">
              <p className="preview-count">Đọc được <strong>{rows.length}</strong> sản phẩm từ file</p>
              <div className="preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Tên sản phẩm</th>
                      <th>Giá bán</th>
                      <th>Serial</th>
                      <th>Màu</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td>{r['Tên sản phẩm']}</td>
                        <td>{r['Giá bán']?.toLocaleString('vi-VN')}₫</td>
                        <td>{r['Serial']}</td>
                        <td>{r['Màu']}</td>
                        <td>{statusLabel(r['status'])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 5 && <p className="preview-more">...và {rows.length - 5} sản phẩm khác</p>}
              </div>

              {!result && (
                <button className="btn-import" onClick={handleImport} disabled={loading}>
                  {loading ? 'Đang import...' : `⬆️ Import ${rows.length} sản phẩm`}
                </button>
              )}
            </div>
          )}

          {result && (
            <div className={`import-result ${result.success ? 'success' : 'error'}`}>
              <p>{result.message}</p>
              {result.success && (
                <button className="btn-done" onClick={() => { onImported(); onClose() }}>
                  Xong
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}