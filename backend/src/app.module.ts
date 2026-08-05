import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MatakuliahModule } from './matakuliah/matakuliah.module';
import { MateriModule } from './materi/materi.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { PublicModule } from './public/public.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    // Config global - tersedia di seluruh aplikasi
    ConfigModule.forRoot({ isGlobal: true }),

    // Logging dengan Pino
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),

    // Rate limiting: 100 request/menit per IP (NFR-4.2)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Serve file statis dari folder uploads/ (foto & PDF)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // Modul database (global)
    PrismaModule,

    // Modul fitur
    AuthModule,
    MatakuliahModule,
    MateriModule,
    JadwalModule,
    PublicModule,
  ],
  providers: [
    // Global Rate Limiting Guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // Global Exception Filter — standarisasi format error response
    { provide: APP_FILTER, useClass: HttpExceptionFilter },

    // Global Response Interceptor — standarisasi format sukses response
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
