// ─── Auth Types ────────────────────────────────────────────────────────────

export interface Dosen {
  id: string;
  nama: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  dosen: Dosen;
}
