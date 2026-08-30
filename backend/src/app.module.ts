import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as Joi from 'joi';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MatakuliahModule } from './matakuliah/matakuliah.module';
import { MateriModule } from './materi/materi.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { PublicModule } from './public/public.module';
import { CacheModule } from '@nestjs/cache-manager';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    // Fix 2: Validasi env variable saat startup — error jelas jika ada yang hilang
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(8).required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
      }),
    }),

    // Logging dengan Pino
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),

    // Default In-Memory Cache (sementara karena Redis local belum jalan)
    CacheModule.register({
      isGlobal: true,
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
