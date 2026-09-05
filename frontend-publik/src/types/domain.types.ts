// ─── Matakuliah Types ──────────────────────────────────────────────────────

export interface Matakuliah {
  id: string
  nama: string
  kode: string
  deskripsi?: string
  thumbnailUrl?: string
  createdAt: string
}

export interface CreateMatakuliahRequest {
  nama: string
  kode: string
  deskripsi?: string
}

export type UpdateMatakuliahRequest = Partial<CreateMatakuliahRequest>

// ─── Foto Materi Types ─────────────────────────────────────────────────────

export interface FotoMateri {
  id: string
  urlFoto: string
  urutan: number
}

export type PdfStatus = 'NONE' | 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'

export interface MateriPage {
  id: string
  pageNumber: number
  imageUrl: string
  width: number
  height: number
  byteSize?: number
}

export interface MateriPagesResponse {
  data: MateriPage[]
  meta: {
    status: PdfStatus
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
  }
}

// ─── Materi Types ──────────────────────────────────────────────────────────

export interface Materi {
  id: string
  matakuliahId?: string
  judul: string
  konten?: string
  pdfUrl?: string
  pdfStatus?: PdfStatus
  pdfTotalPages?: number
  thumbnailUrl?: string
  urutan: number
  createdAt: string
  fotoMateri: FotoMateri[]
  matakuliah?: {
    id: string
    nama: string
    kode?: string
    thumbnailUrl?: string
  }
}

export interface MateriListItem {
  id: string
  judul: string
  urutan: number
  createdAt: string
  konten?: string
  pdfUrl?: string
  pdfStatus?: PdfStatus
  pdfTotalPages?: number
  thumbnailUrl?: string
  fotoMateri: FotoMateri[]
  matakuliah?: {
    id: string
    nama: string
    kode?: string
    thumbnailUrl?: string
  }
}

export interface RekomendasiMateri {
  rekomendasi: Pick<MateriListItem, 'id' | 'judul' | 'urutan'> | null
  isLast: boolean
}

export interface CreateMateriRequest {
  matakuliahId: string
  judul: string
  konten?: string
  urutan: number
}

export type UpdateMateriRequest = Partial<CreateMateriRequest>

// ─── Jadwal Types ──────────────────────────────────────────────────────────

export type HariKuliah = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'

export interface Jadwal {
  id: string
  matakuliahId: string
  hari: HariKuliah
  jamMulai: string
  jamSelesai: string
  ruangan: string
  matakuliah?: { id: string; nama: string; kode: string }
  createdAt: string
}

export interface CreateJadwalRequest {
  matakuliahId: string
  hari: HariKuliah
  jamMulai: string
  jamSelesai: string
  ruangan: string
}

export type UpdateJadwalRequest = Partial<CreateJadwalRequest>
