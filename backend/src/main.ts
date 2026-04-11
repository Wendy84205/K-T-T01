import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import helmet from 'helmet';

// ═══════════════════════════════════════════════════════════
// FIX: In-Memory Rate Limiter (Chống DoS/DDoS & Brute Force API)
// Sliding window: mỗi IP được phép gọi tối đa N request trong T giây
// Không cần @nestjs/throttler - tự implement để không phụ thuộc package
// ═══════════════════════════════════════════════════════════
interface RateLimitEntry { count: number; resetAt: number; }
const rateLimitStore = new Map<string, RateLimitEntry>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: any, res: any, next: () => void) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.connection?.remoteAddress
      || req.socket?.remoteAddress
      || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.status(429).json({
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Quá nhiều yêu cầu. Hãy thử lại sau ${retryAfter} giây.`,
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - entry.count));
    next();
  };
}

// Tự dọn dẹp store mỗi 5 phút để tránh memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // ═══════════════════════════════════════════════════════════
  // FIX: Helmet Security Headers (Chống ClickJacking, MIME Sniffing, XSS)
  // Helmet tự động thêm các header bảo mật quan trọng:
  // - X-Frame-Options: SAMEORIGIN  → chống Clickjacking
  // - X-Content-Type-Options: nosniff → chống MIME Sniffing
  // - X-XSS-Protection            → bảo vệ XSS cơ bản
  // - Strict-Transport-Security   → bắt buộc HTTPS
  // - Content-Security-Policy      → kiểm soát nguồn tài nguyên
  // ═══════════════════════════════════════════════════════════
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Tắt để không break WebSocket/SSE
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'wss:', 'ws:'], // Cho phép WebSocket
      },
    },
  }));

  // ═══════════════════════════════════════════════════════════
  // FIX: Global Rate Limiting (Chống DoS/DDoS)
  // - Auth endpoints (login/register/refresh): 20 req/phút/IP (chặt hơn)
  // - API chung: 120 req/phút/IP
  // ═══════════════════════════════════════════════════════════
  // Rate limiter cho auth endpoints (stricter)
  app.use('/api/v1/auth/login', createRateLimiter(20, 60 * 1000));
  app.use('/api/v1/auth/refresh', createRateLimiter(30, 60 * 1000));
  app.use('/api/v1/auth/forgot-password', createRateLimiter(5, 15 * 60 * 1000));
  app.use('/api/v1/auth/reset-password', createRateLimiter(5, 15 * 60 * 1000));
  app.use('/api/v1/auth/verify-mfa', createRateLimiter(10, 60 * 1000));
  // Rate limiter toàn cục cho tất cả API
  app.use('/api/v1', createRateLimiter(120, 60 * 1000));

  // FIX LỖ HỔNG 6: Giới hạn CORS chỉ cho phép domain từ biến môi trường
  // Trước đây: origin: true → cho phép BẤT KỲ domain nào (nguy hiểm)
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép requests không có Origin header (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin '${origin}' is not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global Filter and Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // FIX LỖ HỔNG 10: Đổi từ false → true để từ chối ngay các field lạ không khai báo trong DTO
      // Trước đây: false → im lặng bỏ qua field không hợp lệ, hacker có thể thăm dò cấu trúc
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  console.log(`=========================================`);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 API: http://localhost:${port}/api/v1`);
  console.log(`🔒 Helmet Security Headers: ENABLED`);
  console.log(`🛡️  Rate Limiting: ENABLED (120 req/min global | 20 req/min auth)`);
  console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`=========================================`);
}
bootstrap();