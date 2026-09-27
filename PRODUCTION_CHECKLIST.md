# ✅ Production Readiness Checklist

جدول صادق لما هو مطبَّق فعليًا في الكود مقابل اللي لسه محتاج شغل، قبل أي نشر حقيقي.

## Code Quality
- [x] TypeScript strict mode (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- [x] Error boundaries (React built-in)
- [ ] ESLint / Prettier - لسه مفيش config files
- [ ] مكتبة validation (Zod أو غيرها) - التحقق حاليًا يدوي في كل route

## Security (راجع `SECURITY.md` للتفاصيل)
- [x] JWT authentication + bcrypt password hashing
- [x] Role-Based Access Control (`requireRole`) على الـ endpoints الحساسة
- [x] Rate limiting, Helmet, CORS, SQL injection prevention (parameterized queries)
- [~] CSRF - مخاطرة منخفضة (JWT في header مش cookies)، بدون middleware صريح
- [ ] Refresh tokens / password reset flow

## Database (راجع `DATABASE_GUIDE.md`)
- [x] Indexes + Foreign keys
- [ ] Automated backups - راجع `DEPLOYMENT.md` للنسخ اليدوي المتاح حاليًا
- [ ] خطة ترقية لـ PostgreSQL/MySQL لو الحجم كبر (SQLite كافي للحجم الحالي)

## Performance (راجع `TECH_STACK.md` → قسم الأداء)
- [x] Route-level code splitting (`React.lazy` لكل صفحة)
- [x] الرسوم البيانية والـ PDF export محمّلين عند الطلب بس، مش من أول تحميل

## Logging & Monitoring
- [x] `/api/health` endpoint
- [x] `console.log`/`console.error` (اللوجينج الوحيد المتاح حاليًا)
- [ ] Structured/persistent logging، Error tracking خارجي (Sentry أو غيره)

## Testing
- [ ] Unit / Integration / E2E tests - لسه مفيش test suite في المشروع

---

## 🚀 النشر

راجع `DEPLOYMENT.md` للخطوات الحقيقية (Docker أو تشغيل مباشر). قبل أي نشر:

```bash
npm audit          # فحص الثغرات في الـ dependencies
npm run build       # build الفرونت والباك
curl http://localhost:3001/api/health   # تأكيد إن السيرفر شغال بعد النشر
```

وتأكد من:
- [ ] `JWT_SECRET` تم تغييره لقيمة عشوائية حقيقية (مش القيمة الافتراضية)
- [ ] `client/.env` مبني بـ `VITE_API_URL=/api` قبل آخر build - راجع `README.md` لو تسجيل الدخول فشل بعد النشر

---

**Part of Seafood QMS - Quality Management System**
