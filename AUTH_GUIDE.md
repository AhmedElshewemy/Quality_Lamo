# 🔐 نظام تسجيل الدخول

## نظرة عامة

النظام الآن يستخدم نظام مصادقة كامل مع كلمات مرور حقيقية مخزنة في ملف `.env`.

---

## 📋 حسابات الدخول الافتراضية

### 👑 مدير النظام (Admin)
```
البريد الإلكتروني: admin@seafood.com
كلمة المرور: Admin@123456
```
**الصلاحيات:**
- الوصول الكامل للنظام
- إدارة المستخدمين
- إدارة الفروع
- جميع التقارير

---

### 📊 مدير الجودة (Quality Manager)
```
البريد الإلكتروني: sara@seafood.com
كلمة المرور: Manager@123
```
**الصلاحيات:**
- لوحة التحكم الشاملة
- عرض جميع المشاكل
- إنشاء التقارير
- مقارنة الأداء
- إدارة الفروع والموظفين

---

### 🔧 مهندسو الجودة (Quality Engineers)

#### المهندس 1 - فرع المعادي
```
البريد الإلكتروني: ahmed@seafood.com
كلمة المرور: Engineer@123
الفرع: branch-1 (المعادي)
```

#### المهندس 2 - فرع مدينة نصر
```
البريد الإلكتروني: mahmoud@seafood.com
كلمة المرور: Engineer@123
الفرع: branch-2 (مدينة نصر)
```

#### المهندس 3 - فرع التجمع الخامس
```
البريد الإلكتروني: khaled@seafood.com
كلمة المرور: Engineer@123
الفرع: branch-3 (التجمع الخامس)
```

**صلاحيات مهندس الجودة:**
- رفع المشاكل الجديدة
- عرض مشاكله فقط
- تحديث حالة المشاكل
- رفع الصور

---

## 🔧 كيفية تعديل بيانات الدخول

### الخطوة 1: افتح ملف `.env`

```bash
# في مجلد المشروع
nano .env
# أو
code .env
```

### الخطوة 2: عدّل البيانات

```bash
# مثال: تغيير كلمة مرور المدير
VITE_ADMIN_EMAIL=admin@seafood.com
VITE_ADMIN_PASSWORD=MyNewSecurePassword123!
VITE_ADMIN_NAME=اسم المدير الجديد

# مثال: إضافة مهندس جديد
VITE_ENGINEER4_EMAIL=newengineer@seafood.com
VITE_ENGINEER4_PASSWORD=Engineer@123
VITE_ENGINEER4_NAME=مهندس جديد
VITE_ENGINEER4_BRANCH=branch-1
```

### الخطوة 3: احفظ وأعد تشغيل التطبيق

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله مرة أخرى
npm run dev
```

---

## 🔒 متطلبات كلمة المرور

### في الوضع الحالي (Development):
- لا يوجد تحقق من قوة كلمة المرور
- يمكنك استخدام أي كلمة مرور

### في الإنتاج (Production):
- الحد الأدنى: 8 أحرف
- يجب أن تحتوي على:
  - حرف كبير (A-Z)
  - حرف صغير (a-z)
  - رقم (0-9)
  - رمز خاص (!@#$%^&*)

---

## 🛡️ الأمان

### ما هو مطبق حالياً:
✅ كلمات مرور مخزنة في `.env`  
✅ التحقق من صحة البيانات  
✅ Session management  
✅ Logging لكل محاولات الدخول  
✅ حماية من الهجمات  

### ما يجب إضافته للإنتاج:
⚠️ Password hashing (bcrypt)  
⚠️ JWT tokens  
⚠️ Rate limiting  
⚠️ Two-factor authentication  
⚠️ Password reset functionality  

---

## 📝 إضافة مستخدمين جدد

### الطريقة 1: عبر ملف `.env`

```bash
# أضف في نهاية ملف .env
VITE_ENGINEER4_EMAIL=newuser@seafood.com
VITE_ENGINEER4_PASSWORD=SecurePass123!
VITE_ENGINEER4_NAME=اسم المستخدم
VITE_ENGINEER4_BRANCH=branch-1
```

### الطريقة 2: عبر قاعدة البيانات مباشرة

```typescript
import { userRepository } from './database/repositories';

userRepository.create({
  name: 'مستخدم جديد',
  email: 'newuser@seafood.com',
  role: 'quality_engineer',
  branch: 'branch-1',
});
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: لا يمكنني تسجيل الدخول

**الحلول:**
1. تأكد من أن ملف `.env` موجود
2. تحقق من البريد الإلكتروني وكلمة المرور
3. تأكد من عدم وجود مسافات زائدة
4. أعد تشغيل التطبيق بعد تعديل `.env`

### المشكلة: المستخدم لا يظهر في النظام

**الحل:**
```bash
# امسح cache المتصفح
# أو افتح في Incognito mode
# أو أعد تشغيل التطبيق
npm run dev
```

### المشكلة: كلمة المرور لا تعمل

**الحل:**
```bash
# تحقق من ملف .env
cat .env | grep VITE_ADMIN_PASSWORD

# تأكد من تطابق كلمة المرور
# أعد تشغيل التطبيق
```

---

## 📊 عرض سجل الدخول

يمكنك عرض سجل محاولات الدخول في Console المتصفح:

```javascript
// افتح Console (F12)
// ستجد رسائل مثل:
// [INFO] [Auth] Login attempt {email: "..."}
// [INFO] [Auth] Login successful {userId: "...", role: "..."}
// [WARN] [Auth] Login failed: Invalid credentials {email: "..."}
```

---

## 🎯 أفضل الممارسات

### 1. لا ترفع `.env` على Git
```bash
# تأكد من أن .env في .gitignore
echo ".env" >> .gitignore
```

### 2. استخدم كلمات مرور قوية
```bash
# جيد: MySecurePass123!
# سيء: 123456
# سيء جداً: password
```

### 3. غيّر كلمات المرور بانتظام
```bash
# كل 90 يوم على الأقل
# استخدم كلمات مرور مختلفة لكل حساب
```

### 4. استخدم `.env.example` كمرجع
```bash
# انسخ من example
cp .env.example .env

# عدّل البيانات
nano .env
```

---

## 🚀 للإنتاج

### قبل النشر:
1. ✅ غيّر جميع كلمات المرور الافتراضية
2. ✅ استخدم كلمات مرور قوية
3. ✅ فعّل HTTPS
4. ✅ أضف rate limiting
5. ✅ فعّل password hashing
6. ✅ أضف two-factor authentication

### مثال على `.env` للإنتاج:
```bash
VITE_ADMIN_EMAIL=admin@company.com
VITE_ADMIN_PASSWORD=VeryStrongPassword2024!@#
VITE_ADMIN_NAME=مدير النظام

VITE_MANAGER_EMAIL=manager@company.com
VITE_MANAGER_PASSWORD=AnotherStrongPass2024!@#
VITE_MANAGER_NAME=مدير الجودة

# ... باقي البيانات
```

---

## 📞 الدعم

إذا واجهت مشكلة في تسجيل الدخول:
1. راجع هذا الدليل
2. تحقق من ملف `.env`
3. راجع Console المتصفح
4. تواصل مع الدعم الفني

---

**آخر تحديث:** 2024  
**الإصدار:** 1.0.0
