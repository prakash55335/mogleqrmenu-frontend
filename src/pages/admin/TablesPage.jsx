import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getTables } from '../../api/tableApi'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { AdminNavbar } from './OrderPage'

export default function TablesPage() {
  const [tables, setTables]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [showAdd, setShowAdd]         = useState(false)
  const [newTableNum, setNewTableNum] = useState('')
  const [adding, setAdding]           = useState(false)
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const loadTables = () => {
    getTables()
      .then(res => setTables(res.data.data))
      .catch(() => toast.error('Failed to load tables'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTables() }, [])

  const handleAddTable = async () => {
    if (!newTableNum) return toast.error('Enter table number')
    const num = parseInt(newTableNum)
    if (isNaN(num) || num < 1) return toast.error('Invalid table number')
    if (tables.find(t => t.table_number === num)) {
      return toast.error(`Table ${num} already exists!`)
    }
    setAdding(true)
    try {
      await API.post('/api/v1/tables/', { table_number: num })
      toast.success(`Table ${num} created!`)
      setNewTableNum('')
      setShowAdd(false)
      loadTables()
    } catch (err) {
      toast.error(err.response?.data?.errors?.table_number?.[0] || 'Failed to create table')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <AdminNavbar ordersCount={0} billingCount={0} />
      {/* Main Content */}
      <div style={{ padding: '20px 16px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Title and Add Button */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px',
          flexWrap: 'wrap', gap: '12px'
        }}>
          <h2 style={{
            color: '#facc15', fontSize: 'clamp(18px, 4vw, 26px)',
            fontWeight: '900', letterSpacing: '2px',
            textTransform: 'uppercase', margin: 0
          }}>
            Tables
            <span style={{
              backgroundColor: '#facc15', color: '#000',
              borderRadius: '20px', padding: '2px 10px',
              fontSize: '14px', fontWeight: '900', marginLeft: '10px'
            }}>
              {tables.length}
            </span>
          </h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              backgroundColor: showAdd ? '#3f3f46' : '#facc15',
              color: showAdd ? '#fff' : '#000', border: 'none',
              borderRadius: '10px', padding: '10px 18px',
              fontWeight: '900', cursor: 'pointer', fontSize: '14px'
            }}
          >
            {showAdd ? 'Cancel' : '+ Add Table'}
          </button>
        </div>

        {/* Add Table Form */}
        {showAdd && (
          <div style={{
            backgroundColor: '#18181b', border: '2px solid #facc15',
            borderRadius: '16px', padding: '20px', marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#facc15', fontWeight: '900',
              marginBottom: '12px', fontSize: '16px'
            }}>
              Generate New Table QR
            </h3>
            <p style={{ color: '#71717a', fontSize: '13px', marginBottom: '14px' }}>
              Enter table number. A unique QR code will be generated automatically.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="number"
                value={newTableNum}
                onChange={e => setNewTableNum(e.target.value)}
                placeholder="Table number e.g. 9"
                min="1"
                style={{
                  flex: 1, minWidth: '160px', backgroundColor: '#000',
                  border: '2px solid #3f3f46', borderRadius: '10px',
                  padding: '10px 14px', color: '#fff',
                  fontSize: '15px', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#facc15'}
                onBlur={e => e.target.style.borderColor = '#3f3f46'}
                onKeyDown={e => e.key === 'Enter' && handleAddTable()}
              />
              <button
                onClick={handleAddTable}
                disabled={adding}
                style={{
                  backgroundColor: adding ? '#a16207' : '#facc15',
                  color: '#000', border: 'none', borderRadius: '10px',
                  padding: '10px 20px', fontWeight: '900',
                  cursor: adding ? 'not-allowed' : 'pointer', fontSize: '14px'
                }}
              >
                {adding ? 'Creating...' : 'Generate QR'}
              </button>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#facc15' }}>
            Loading tables...
          </div>
        ) : tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#3f3f46', fontSize: '16px' }}>
            No tables found. Add a table to get started.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {tables.map(table => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TableCard({ table }) {
  const downloadUrl  = `http://127.0.0.1:8000/api/v1/tables/${table.id}/qr/`
  const previewUrl   = `http://localhost:5173/menu?tableId=${table.id}`
  const downloadName = `Table_${table.table_number}_QR.png`

  return (
    <div style={{
      backgroundColor: '#18181b', border: '2px solid #facc15',
      borderRadius: '14px', padding: '16px', textAlign: 'center'
    }}>
      <h3 style={{
        color: '#facc15', fontSize: '18px',
        fontWeight: '900', marginBottom: '12px'
      }}>
        Table {table.table_number}
      </h3>

      <img
        src={downloadUrl}
        alt={`QR Table ${table.table_number}`}
        style={{
          width: '140px', height: '140px',
          borderRadius: '8px', border: '2px solid #facc15',
          maxWidth: '100%', display: 'block', margin: '0 auto'
        }}
      />

      <p style={{ color: '#71717a', fontSize: '11px', margin: '10px 0' }}>
        Scan to open menu
      </p>

      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <DownloadButton url={downloadUrl} filename={downloadName} label="Download" />
        <PreviewButton url={previewUrl} />
      </div>
    </div>
  )
}

function DownloadButton({ url, filename, label }) {
  return (
    <a
      href={url}
      download={filename}
      style={{
        backgroundColor: '#facc15', color: '#000',
        padding: '6px 12px', borderRadius: '6px',
        fontWeight: '700', fontSize: '12px',
        textDecoration: 'none', display: 'inline-block'
      }}
    >
      {label}
    </a>
  )
}

function PreviewButton({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        backgroundColor: '#27272a', color: '#facc15',
        padding: '6px 12px', borderRadius: '6px',
        fontWeight: '700', fontSize: '12px',
        textDecoration: 'none', display: 'inline-block',
        border: '1px solid #facc15'
      }}
    >
      Preview
    </a>
  )
}