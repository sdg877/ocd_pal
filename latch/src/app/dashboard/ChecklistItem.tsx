'use client'

import { useState, useRef } from 'react'

export default function ChecklistItem({
  itemId,
  itemName,
}: {
  itemId: string
  itemName: string
}) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('uploading')

    try {
      // 1. Get a pre-signed upload URL
      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      const { url, fields, key } = await urlRes.json()

      // 2. Upload directly to S3
      const formData = new FormData()
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v as string))
      formData.append('Content-Type', file.type)
      formData.append('file', file)

      const uploadRes = await fetch(url, { method: 'POST', body: formData })

      if (!uploadRes.ok) throw new Error('Upload failed')

      // 3. Save the check record
      const checkRes = await fetch('/api/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, photoKey: key }),
      })

      if (!checkRes.ok) throw new Error('Failed to save check')

      setStatus('done')
      setLastChecked(new Date().toLocaleTimeString())
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="font-medium">{itemName}</p>
        {status === 'done' && lastChecked && (
          <p className="text-sm text-green-600">Checked at {lastChecked}</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-600">Something went wrong — try again</p>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'uploading'}
        className="rounded bg-black px-4 py-2 text-white text-sm disabled:opacity-50"
      >
        {status === 'uploading' ? 'Uploading…' : 'Take photo'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}