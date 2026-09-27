import type BetterSqlite3 from 'better-sqlite3';
import bcrypt from 'bcryptjs';

/** Populates an empty database with the restaurant's real branches, seed users, and sample issues. */
export const seedInitialData = (db: BetterSqlite3.Database) => {
  console.log('🌱 Seeding initial data...');

  // Branches - matches the restaurant's real structure: 3 branches plus one
  // site that houses both the central kitchen and the main warehouse.
  const branches = [
    ['branch-1', 'فرع المعادي', 'المعادي، القاهرة', 'branch'],
    ['branch-2', 'فرع مدينة نصر', 'مدينة نصر، القاهرة', 'branch'],
    ['branch-3', 'فرع التجمع الخامس', 'التجمع الخامس، القاهرة الجديدة', 'branch'],
    ['central-kitchen', 'المطبخ المركزي والمخزن الرئيسي', 'العاشر من رمضان', 'central_kitchen_warehouse'],
  ];

  const insertBranch = db.prepare(
    'INSERT INTO branches (id, name, location, type) VALUES (?, ?, ?, ?)'
  );
  for (const branch of branches) {
    insertBranch.run(...branch);
  }

  // Users - see AUTH_GUIDE.md for the full credentials table.
  const users = [
    ['admin-1', 'مدير النظام', 'admin@seafood.com', 'Admin@123456', 'admin', null],
    ['manager-1', 'د. سارة أحمد', 'sara@seafood.com', 'Manager@123', 'quality_manager', null],
    ['user-1', 'أحمد محمد', 'ahmed@seafood.com', 'Engineer@123', 'quality_engineer', 'branch-1'],
    ['user-2', 'محمود علي', 'mahmoud@seafood.com', 'Engineer@123', 'quality_engineer', 'branch-2'],
    ['user-3', 'خالد حسن', 'khaled@seafood.com', 'Engineer@123', 'quality_engineer', 'branch-3'],
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role, branch_id) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const user of users) {
    const [id, name, email, password, role, branchId] = user;
    const passwordHash = bcrypt.hashSync(password as string, 10);
    insertUser.run(id, name, email, passwordHash, role, branchId);
  }

  // Sample issues
  const now = new Date();
  const daysAgo = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date.toISOString();
  };

  const issues = [
    ['issue-1', 'ارتفاع درجة حرارة الثلاجة الرئيسية', 'تم رصد ارتفاع في درجة حرارة الثلاجة الرئيسية عن المعدل المطلوب', 'branch-1', 'temperature', 'critical', 'resolved', 'non_compliant', '[]', 'user-1', daysAgo(2), daysAgo(1), 'تم إصلاح الثلاجة وضبط الحرارة', null, null],
    ['issue-2', 'عدم ارتداء قفازات أثناء تحضير الطعام', 'لاحظ عدم ارتداء بعض العاملين للقفازات', 'branch-2', 'hygiene', 'high', 'in_progress', 'partially_compliant', '[]', 'user-2', daysAgo(5), null, null, 'user-2', null],
    ['issue-3', 'تخزين منتجات منتهية الصلاحية', 'تم العثور على بعض المنتجات منتهية الصلاحية', 'central-kitchen', 'storage', 'high', 'resolved', 'non_compliant', '[]', 'user-1', daysAgo(10), daysAgo(8), 'تم التخلص من المنتجات', null, null],
    ['issue-4', 'عدم وجود سجلات تنظيف يومية', 'سجلات التنظيف اليومية غير مكتملة', 'branch-3', 'documentation', 'medium', 'open', 'partially_compliant', '[]', 'user-3', daysAgo(3), null, null, null, null],
    ['issue-5', 'تسريب مياه في منطقة التحضير', 'يوجد تسريب مياه بالقرب من منطقة تحضير الخضروات', 'central-kitchen', 'equipment', 'medium', 'in_progress', 'partially_compliant', '[]', 'user-1', daysAgo(7), null, null, 'user-1', null],
  ];

  const insertIssue = db.prepare(`
    INSERT INTO issues (id, title, description, branch_id, category, priority, status, compliance_status, images, reported_by, reported_at, resolved_at, resolution_notes, assigned_to, follow_up_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const issue of issues) {
    insertIssue.run(...issue);
  }

  console.log('✅ Initial data seeded');
};
