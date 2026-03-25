'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Upload, X, FileIcon, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { formatBytes } from '@/lib/utils'

interface Category { id: number; name: string }

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ filePath: string; fileName: string; fileSize: number; mimeType: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [previews, setPreviews] = useState<{ file: File; path: string }[]>([])
  const [uploadingPreview, setUploadingPreview] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [tags, setTags] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login') }).catch(() => router.push('/login'))
    fetch('/api/categories').then(r => r.ok ? r.json() : []).then(setCategories).catch(() => {})
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current)
      if (xhrRef.current) xhrRef.current.abort()
    }
  }, [router])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }, [])

  function handleFileSelect(f: File) {
    setFile(f)
    setUploadedFile(null)
    setUploadError('')
    setName(prev => prev || f.name.replace(/\.[^.]+$/, ''))
    uploadFile(f)
  }

  function uploadFile(f: File) {
    setUploading(true)
    setUploadProgress(0)
    setUploadError('')
    const formData = new FormData()
    formData.append('file', f)
    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr
    xhr.open('POST', '/api/upload')
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      setUploading(false)
      if (xhr.status === 200 || xhr.status === 201) {
        setUploadedFile(JSON.parse(xhr.responseText))
      } else {
        try { setUploadError(JSON.parse(xhr.responseText).error || 'Upload failed') } catch { setUploadError('Upload failed') }
      }
    }
    xhr.onerror = () => { setUploading(false); setUploadError('Network error') }
    xhr.onabort = () => { setUploading(false) }
    xhr.send(formData)
  }

  async function handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingPreview(true)
    for (const f of files.slice(0, 5 - previews.length)) {
      const formData = new FormData()
      formData.append('file', f)
      try {
        const res = await fetch('/api/upload/preview', { method: 'POST', body: formData })
        if (res.ok) {
          const { path } = await res.json()
          setPreviews(prev => [...prev, { file: f, path }])
        }
      } catch {}
    }
    setUploadingPreview(false)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadedFile) return
    setSubmitting(true)
    setSubmitError('')
    const priceInCents = Math.round(parseFloat(price || '0') * 100)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        price: priceInCents,
        tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        categoryId: categoryId ? parseInt(categoryId) : null,
        ...uploadedFile,
        previewPaths: previews.map(p => p.path),
      }),
    })
    if (res.ok) {
      setDone(true)
      redirectTimer.current = setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      const data = await res.json()
      setSubmitError(data.error || 'Failed to create listing')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">New Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragging ? 'border-indigo-500 bg-indigo-900/20'
              : uploadedFile ? 'border-green-600 bg-green-900/10'
              : file && uploading ? 'border-zinc-600 bg-zinc-800/50'
              : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900'
            }`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            {file ? (
              <div className="flex items-center gap-3">
                <FileIcon size={32} className={`flex-shrink-0 ${uploadedFile ? 'text-green-400' : 'text-indigo-400'}`} />
                <div className="text-left min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <p className="text-zinc-400 text-sm">{formatBytes(BigInt(file.size))}</p>
                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-zinc-700 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-zinc-500 text-xs mt-1">Uploading... {uploadProgress}%</p>
                    </div>
                  )}
                  {uploadedFile && <p className="text-green-400 text-xs mt-1">✓ Uploaded successfully</p>}
                  {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setUploadedFile(null) }}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={32} className="text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-300 font-medium">Drop your 3D model file here or click to browse</p>
                <p className="text-zinc-500 text-sm mt-1">Supports all formats: .blend, .obj, .fbx, .stl, .glb and more</p>
              </div>
            )}
          </div>

          {uploadedFile && (
            <>
              {/* Preview images */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Preview Images <span className="text-zinc-500">(up to 5, optional)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {previews.map((p, i) => (
                    <div key={i} className="relative w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden">
                      <img src={URL.createObjectURL(p.file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPreviews(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 text-white hover:bg-red-600"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingPreview}
                      className="w-20 h-20 bg-zinc-800 border border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
                    >
                      {uploadingPreview ? <Loader2 size={18} className="animate-spin" /> : <><Image size={18} /><span className="text-xs mt-1">Add</span></>}
                    </button>
                  )}
                </div>
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handlePreviewUpload} />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Listing Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description <span className="text-zinc-500">(optional)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="Describe your model: polygon count, formats included, what it's suitable for..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
                    placeholder="0.00 — leave empty for free"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm" />
                </div>
                <p className="text-zinc-600 text-xs mt-1">Leave at $0.00 for a free listing</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm">
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags <span className="text-zinc-500">(comma-separated)</span></label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. vehicle, low-poly, blender"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm" />
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
                  <AlertCircle size={16} /><span className="text-sm">{submitError}</span>
                </div>
              )}
              {done && (
                <div className="flex items-center gap-2 text-green-400 bg-green-900/20 border border-green-800 rounded-lg px-4 py-3">
                  <CheckCircle size={16} /><span className="text-sm">Listing created! Redirecting...</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="submit" disabled={submitting || done || uploading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
                <button type="button" onClick={() => router.back()}
                  className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  )
}
