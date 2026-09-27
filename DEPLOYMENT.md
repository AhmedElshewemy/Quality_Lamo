# 🚀 دليل النشر

المشروع عنده طريقتين حقيقيتين للتشغيل، وكل حاجة تحت مبنية على الملفات الموجودة فعليًا في الريبو (مش خيارات نظرية).

---

## الطريقة 1: Docker (الأفضل للنشر الحقيقي)

`Dockerfile` موجود بالفعل - بيبني الفرونت والباك في stages منفصلة، وبينتج image واحد شغال.

```bash
# اضبط الأسرار في .env في نفس مجلد docker-compose.yml
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

docker compose up -d --build
```

بعد كده الموقع شغال على `http://localhost:3001`.

**نقاط مهمة في `docker-compose.yml`:**
- `DB_PATH=/app/data/seafood_qms.db` - لازم يكون جوه الفولدر المُحمّل (`volumes: app-data:/app/data`)، وإلا قاعدة البيانات تضيع مع كل `docker compose restart`.
- `JWT_SECRET` بييجي من ملف `.env` بتاعك (مش الملف اللي جوه `server/`) - غيّره لقيمة عشوائية حقيقية قبل أي نشر فعلي، القيمة الافتراضية للتطوير بس.
- الـ healthcheck بيستخدم `/api/health` - لو الـ container فضل "unhealthy"، شوف اللوج: `docker compose logs -f`.

**لعمل نسخة احتياطية من قاعدة البيانات:**
```bash
docker compose cp app:/app/data/seafood_qms.db ./backup-$(date +%Y%m%d).db
```
مفيش backup تلقائي مبني حاليًا - ده أمر تشغّله بنفسك (أو تضيفه لـ cron إن كان السيرفر بتاعك عنده واحد).

---

## الطريقة 2: تشغيل مباشر (Node.js بدون Docker)

مفيد لو عندك VPS بسيط أو عايز تجرب من غير Docker خالص.

```bash
npm run install:all
npm run build

# اضبط server/.env (PORT, JWT_SECRET, DB_PATH, CLIENT_URL) - راجع README.md
npm start
```

`npm start` (في الروت) بيشغّل `server/dist/index.js`، اللي بيخدّم الـ API والفرونت المبني (`client/dist`) من نفس البورت.

**لو عايز السيرفر يفضل شغال بعد ما تقفل الـ terminal:** استخدم أي process manager عندك بالفعل على السيرفر (`pm2`, `systemd`, `screen`, ...) - مفيش حاجة مطلوبة خاصة بالمشروع ده، هو مجرد process Node.js عادي.

---

## ✅ قبل ما تنشر فعليًا

- [ ] `JWT_SECRET` تم تغييره لقيمة عشوائية (مش الافتراضية)
- [ ] `client/.env` مبني بـ `VITE_API_URL=/api` (نسبي) - راجع `README.md` لو الـ login بيفشل بعد النشر
- [ ] قاعدة البيانات (`seafood_qms.db`) في مسار محفوظ (volume في Docker، أو مسار دائم على السيرفر)
- [ ] `/api/health` بيرجع `200` من الدومين النهائي
- [ ] راجع `SECURITY.md` و `PRODUCTION_CHECKLIST.md` لأي نقطة أمان لسه مش مطبّقة

---

**Part of Seafood QMS - Quality Management System**
