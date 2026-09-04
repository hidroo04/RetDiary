import apiClient, { unwrapApiData } from './client'
import type { ApiResponse } from '@/types/api.types'
import type {
  Materi,
  MateriListItem,
  CreateMateriRequest,
  UpdateMateriRequest,
  FotoMateri,
} from '@/types/domain.types'

export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024
const UPLOAD_TIMEOUT_MS = 120_000

type UploadProgressCallback = (percentage: number) => void

export function validatePdfFile(file: File): void {
  const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf')
  const isPdf = file.type === 'application/pdf' || (!file.type && hasPdfExtension)
  if (!isPdf) throw new Error('Berkas harus berformat PDF.')
  if (file.size > MAX_PDF_SIZE_BYTES) throw new Error('Ukuran PDF maksimum 10 MB.')
}

export function validateThumbnailFile(file: File): void {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name)
  if (!allowedTypes.includes(file.type) && !(!file.type && hasAllowedExtension)) {
    throw new Error('Format thumbnail harus JPG, PNG, atau WebP.')
  }
  if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
    throw new Error('Ukuran thumbnail maksimum 5 MB.')
  }
}

function toUploadPercentage(loaded: number, total?: number, progress?: number): number {
  if (typeof progress === 'number') return Math.min(100, Math.round(progress * 100))
  if (!total) return 0
  return Math.min(100, Math.round((loaded / total) * 100))
}

export const materiApi = {
  getAll: async (params?: { matakuliahId?: string; search?: string }): Promise<Materi[]> => {
    const res = await apiClient.get<ApiResponse<Materi[]>>('/admin/materi', {
      params,
    })
    return unwrapApiData(res.data)
  },

  getById: async (id: string): Promise<Materi> => {
    const res = await apiClient.get<ApiResponse<Materi>>(`/admin/materi/${id}`)
    return unwrapApiData(res.data)
  },

  getAllByMatakuliah: async (matakuliahId: string): Promise<MateriListItem[]> => {
    const res = await apiClient.get<ApiResponse<MateriListItem[]>>(
      `/admin/matakuliah/${matakuliahId}/materi`,
    )
    return unwrapApiData(res.data)
  },

  create: async (
    data: CreateMateriRequest,
    pdfFile?: File,
    thumbnailFile?: File,
    onUploadProgress?: UploadProgressCallback,
  ): Promise<Materi> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value))
    })
    if (pdfFile) {
      validatePdfFile(pdfFile)
      formData.append('pdf', pdfFile)
    }
    if (thumbnailFile) {
      validateThumbnailFile(thumbnailFile)
      formData.append('thumbnail', thumbnailFile)
    }
    const res = await apiClient.post<ApiResponse<Materi>>('/admin/materi', formData, {
      timeout: UPLOAD_TIMEOUT_MS,
      onUploadProgress: ({ loaded, total, progress }) => {
        onUploadProgress?.(toUploadPercentage(loaded, total, progress))
      },
    })
    return unwrapApiData(res.data)
  },

  update: async (
    id: string,
    data: UpdateMateriRequest,
    pdfFile?: File,
    thumbnailFile?: File,
    onUploadProgress?: UploadProgressCallback,
  ): Promise<Materi> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value))
    })
    if (pdfFile) {
      validatePdfFile(pdfFile)
      formData.append('pdf', pdfFile)
    }
    if (thumbnailFile) {
      validateThumbnailFile(thumbnailFile)
      formData.append('thumbnail', thumbnailFile)
    }
    const res = await apiClient.put<ApiResponse<Materi>>(`/admin/materi/${id}`, formData, {
      timeout: UPLOAD_TIMEOUT_MS,
      onUploadProgress: ({ loaded, total, progress }) => {
        onUploadProgress?.(toUploadPercentage(loaded, total, progress))
      },
    })
    return unwrapApiData(res.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/materi/${id}`)
  },

  uploadFoto: async (materiId: string, files: File[]): Promise<FotoMateri[]> => {
    const formData = new FormData()
    files.forEach((file) => formData.append('foto', file))
    const res = await apiClient.post<ApiResponse<FotoMateri[]>>(
      `/admin/materi/${materiId}/foto`,
      formData,
      { timeout: UPLOAD_TIMEOUT_MS },
    )
    return unwrapApiData(res.data)
  },

  deleteFoto: async (fotoId: string): Promise<void> => {
    await apiClient.delete(`/admin/foto/${fotoId}`)
  },
}
