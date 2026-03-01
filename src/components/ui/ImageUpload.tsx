'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  className?: string
}

export function ImageUpload({ value, onChange, label = 'Event Image', className = '' }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  const uploadToCloudinary = useCallback(async (file: File) => {
    if (!cloudName || !uploadPreset) {
      setError('Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.')
      return
    }

    setError(null)
    setIsUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'ticketly')

      const xhr = new XMLHttpRequest()

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            resolve(data.secure_url)
          } else {
            let msg = 'Upload failed'
            try {
              const errData = JSON.parse(xhr.responseText)
              msg = errData?.error?.message || msg
            } catch {}
            console.error('Cloudinary error:', xhr.status, xhr.responseText)
            reject(new Error(msg))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
        xhr.send(formData)
      })

      const url = await uploadPromise
      onChange(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
      console.error('Cloudinary upload error:', err)
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }, [cloudName, uploadPreset, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadToCloudinary(file)
  }, [uploadToCloudinary])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadToCloudinary(file)
    if (inputRef.current) inputRef.current.value = ''
  }, [uploadToCloudinary])

  const handleRemove = () => {
    onChange('')
    setError(null)
  }

  // If there's a value (URL), show preview
  if (value) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-xs text-white/60 uppercase tracking-wider">{label}</label>
        <div className="relative rounded-xl overflow-hidden border border-white/10 group">
          <img src={value} alt="Upload preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="btn-danger text-xs px-4 py-2"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs text-white/60 uppercase tracking-wider">{label}</label>
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-8 text-center
          ${isDragging
            ? 'border-brand-400 bg-brand-600/10'
            : 'border-white/10 hover:border-white/20 hover:bg-white/02'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-brand-400 mx-auto animate-spin" />
            <p className="text-sm text-white/60">Uploading... {progress}%</p>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl glass flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-6 h-6 text-brand-400" />
              ) : (
                <Upload className="w-6 h-6 text-white/30" />
              )}
            </div>
            <div>
              <p className="text-sm text-white/60">
                {isDragging ? 'Drop your image here' : 'Drag & drop an image, or click to browse'}
              </p>
              <p className="text-xs text-white/30 mt-1">PNG, JPG, WebP up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Fallback URL input */}
      {!cloudName && (
        <div className="space-y-1">
          <p className="text-[10px] text-white/30">Or paste an image URL directly:</p>
          <input
            type="url"
            placeholder="https://example.com/image.png"
            className="input-field w-full text-sm"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
