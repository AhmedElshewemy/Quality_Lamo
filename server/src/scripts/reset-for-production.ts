/**
 * One-time production setup.
 *
 * Deletes all sample/test issues and users (the demo accounts seeded for
 * development), keeps the branches table as-is (those are the restaurant's
 * real locations, not test data), and creates exactly one real admin account.
 *
 * Requires explicit confirmation so it can never run by accident:
 *
 *   ADMIN_NAME="اسمك" ADMIN_EMAIL="you@yourcompany.com" ADMIN_PASSWORD="..." \
 *     npm run reset-for-production -- --confirm
 *
 * (during development, from server/: `npm run reset-for-production:dev -- --confirm`)
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';

const CONFIRMED = process.argv.includes('--confirm');

const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function fail(message: string): never {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

if (!CONFIRMED) {
  fail(
    'لازم تضيف --confirm عشان تأكّد إنك عايز تمسح كل الحسابات والمشاكل التجريبية.\n' +
      'مثال:\n' +
      '  ADMIN_NAME="اسمك" ADMIN_EMAIL="you@company.com" ADMIN_PASSWORD="..." npm run reset-for-production -- --confirm'
  );
}

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  fail('لازم تحدد ADMIN_NAME و ADMIN_EMAIL و ADMIN_PASSWORD كـ environment variables.');
}

if (ADMIN_PASSWORD.length < 8) {
  fail('ADMIN_PASSWORD لازم يكون 8 حروف على الأقل.');
}

console.log('🗑️  بمسح كل المشاكل والمستخدمين التجريبيين...');
db.prepare('DELETE FROM issues').run();
db.prepare('DELETE FROM users').run();

const branchCount = (db.prepare('SELECT COUNT(*) as count FROM branches').get() as { count: number }).count;
console.log(`✅ الفروع (${branchCount}) اتسابت زي ما هي - دي بيانات حقيقية مش تجريبية.`);

const id = `admin-${Date.now()}`;
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

db.prepare(
  'INSERT INTO users (id, name, email, password_hash, role, branch_id) VALUES (?, ?, ?, ?, ?, ?)'
).run(id, ADMIN_NAME, ADMIN_EMAIL, passwordHash, 'admin', null);

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  ✅ تم التجهيز للإنتاج                                     ║
║                                                             ║
║  - كل المشاكل والمستخدمين التجريبيين تم مسحهم              ║
║  - حساب أدمن واحد حقيقي تم إنشاؤه:                          ║
║      ${ADMIN_EMAIL}
║                                                             ║
║  سجّل دخول بيه دلوقتي، وأضف باقي الفريق من صفحة             ║
║  "الموظفين" في الواجهة (Add User متاحة للأدمن بس).          ║
╚═══════════════════════════════════════════════════════════╝
`);

db.close();
