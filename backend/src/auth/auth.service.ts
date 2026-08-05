import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // FR-12: jangan bocorkan mana yang salah (email atau password)
    const dosen = await this.prisma.dosen.findUnique({ where: { email } });
    if (!dosen) {
      throw new UnauthorizedException('Email atau kata sandi salah.');
    }

    const isPasswordValid = await bcrypt.compare(password, dosen.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau kata sandi salah.');
    }

    const payload = { sub: dosen.id, email: dosen.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      dosen: {
        id: dosen.id,
        nama: dosen.nama,
        email: dosen.email,
      },
    };
  }

  // FR-13A: logout cukup di sisi client (hapus token),
  // response ini menjadi sinyal bahwa logout berhasil.
  logout() {
    return { message: 'Berhasil logout. Silakan hapus token di sisi client.' };
  }

  async getDashboard(dosenId: string) {
    // FR-13B: Dashboard Summary
    const [jumlahMatakuliah, jumlahMateri, materiTerbaru] = await Promise.all([
      this.prisma.matakuliah.count({ where: { dosenId } }),
      this.prisma.materi.count({
        where: { matakuliah: { dosenId } },
      }),
      this.prisma.materi.findFirst({
        where: { matakuliah: { dosenId } },
        orderBy: { createdAt: 'desc' },
        select: { judul: true, createdAt: true, matakuliah: { select: { nama: true } } },
      }),
    ]);

    return {
      jumlahMatakuliah,
      jumlahMateri,
      materiTerbaru,
    };
  }
}
