#!/bin/bash

# نقل ملفات Frontend من src/ إلى client/src/

echo "🚀 نقل ملفات Frontend..."

# إنشاء المجلدات
mkdir -p client/src/contexts
mkdir -p client/src/pages
mkdir -p client/src/components
mkdir -p client/src/utils
mkdir -p client/src/services
mkdir -p client/src/types
mkdir -p client/src/validation
mkdir -p client/src/config
mkdir -p client/src/data
mkdir -p client/src/database/repositories

# نسخ الملفات
cp -r src/contexts/* client/src/contexts/ 2>/dev/null || true
cp -r src/pages/* client/src/pages/ 2>/dev/null || true
cp -r src/components/* client/src/components/ 2>/dev/null || true
cp -r src/utils/* client/src/utils/ 2>/dev/null || true
cp -r src/services/* client/src/services/ 2>/dev/null || true
cp -r src/types/* client/src/types/ 2>/dev/null || true
cp -r src/validation/* client/src/validation/ 2>/dev/null || true
cp -r src/config/* client/src/config/ 2>/dev/null || true
cp -r src/data/* client/src/data/ 2>/dev/null || true
cp -r src/database/* client/src/database/ 2>/dev/null || true

echo "✅ تم النقل بنجاح!"
echo ""
echo "📁 الهيكل الجديد:"
tree client/src -L 2 2>/dev/null || find client/src -type d
