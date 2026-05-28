import { useState } from 'react'
import { supabase } from '../../api/supabaseClient'

export default function ImageUpload({ currentUrl, onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(currentUrl || '')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`

    const { error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file, { upsert: true })

    if (error) {
      alert('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage
      .from('food-images')
      .getPublicUrl(fileName)

    setPreview(data.publicUrl)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
        Food image
      </label>

      {preview ? (
        <img
          src={preview}
          alt="preview"
          style={{
            width: '100%', height: 160, objectFit: 'cover',
            borderRadius: 8, marginBottom: 8,
            border: '1px solid #eee'
          }}
        />
      ) : (
        <div style={{
          width: '100%', height: 120, borderRadius: 8, marginBottom: 8,
          border: '2px dashed #e0e0e0', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#ccc', fontSize: 13
        }}>
          No image
        </div>
      )}

      <label style={{
        display: 'inline-block', padding: '8px 16px',
        background: '#f5f5f5', borderRadius: 6,
        border: '1px solid #ddd', fontSize: 13, cursor: 'pointer'
      }}>
        {uploading ? 'Uploading...' : preview ? 'Change image' : 'Upload image'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </label>
    </div>
  )
}