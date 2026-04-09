import { pgTable, text, timestamp, boolean, uuid, varchar, integer, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['STUDENT', 'STUDENT_COORDINATOR', 'FACULTY', 'PROGRAM_HEAD', 'HOD', 'LEAD_SE', 'AO', 'ADMIN']);
export const eventStatusEnum = pgEnum('event_status', ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'COMPLETED', 'ARCHIVED']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']);

// --- Better Auth Tables ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  role: roleEnum('role').notNull(),
  departmentId: text('department_id')
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id)
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt')
});

// --- Application Domain Tables ---

// 1. Events
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  coverImage: text('cover_image'),
  status: eventStatusEnum('status').default('DRAFT').notNull(),
  createdBy: text('created_by').references(() => user.id).notNull(),
  isPaid: boolean('is_paid').default(false).notNull(),
  price: integer('price'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const eventApprovals = pgTable('event_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  approverRole: roleEnum('approver_role').notNull(),
  status: eventStatusEnum('status').notNull(),
  approvedBy: text('approved_by').references(() => user.id),
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 2. Venues & Sessions
export const venues = pgTable('venues', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const eventSessions = pgTable('event_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  venueId: uuid('venue_id').references(() => venues.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const venueAllocations = pgTable('venue_allocations', {
  id: uuid('id').defaultRandom().primaryKey(),
  venueId: uuid('venue_id').references(() => venues.id).notNull(),
  eventSessionId: uuid('event_session_id').references(() => eventSessions.id).notNull(),
  status: eventStatusEnum('status').default('PENDING_APPROVAL').notNull(), // Can reuse status enum if appropriate
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 3. Registrations & Payments
export const registrations = pgTable('registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  studentId: text('student_id').references(() => user.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const paymentRecords = pgTable('payment_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
  amount: integer('amount').notNull(),
  status: paymentStatusEnum('status').default('PENDING').notNull(),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 4. Attendance
export const attendanceTokens = pgTable('attendance_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventSessionId: uuid('event_session_id').references(() => eventSessions.id).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  fallbackCode: varchar('fallback_code', { length: 8 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventSessionId: uuid('event_session_id').references(() => eventSessions.id).notNull(),
  studentId: text('student_id').references(() => user.id).notNull(),
  status: attendanceStatusEnum('status').default('PRESENT').notNull(),
  scannedAt: timestamp('scanned_at').defaultNow().notNull()
});

export const attendanceSubmissions = pgTable('attendance_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventSessionId: uuid('event_session_id').references(() => eventSessions.id).notNull(),
  facultyId: text('faculty_id').references(() => user.id).notNull(),
  approvedBy: text('approved_by').references(() => user.id),
  isApproved: boolean('is_approved').default(false).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull()
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: varchar('action', { length: 255 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  userId: text('user_id').references(() => user.id),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// --- Relations ---

export const userRelations = relations(user, ({ many }) => ({
  events: many(events),
  registrations: many(registrations),
  sessions: many(session)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(user, { fields: [events.createdBy], references: [user.id] }),
  sessions: many(eventSessions),
  approvals: many(eventApprovals),
  registrations: many(registrations)
}));

export const eventSessionsRelations = relations(eventSessions, ({ one, many }) => ({
  event: one(events, { fields: [eventSessions.eventId], references: [events.id] }),
  venue: one(venues, { fields: [eventSessions.venueId], references: [venues.id] }),
  tokens: many(attendanceTokens)
}));

export const eventApprovalsRelations = relations(eventApprovals, ({ one }) => ({
  event: one(events, { fields: [eventApprovals.eventId], references: [events.id] })
}));

export const registrationRelations = relations(registrations, ({ one }) => ({
  event: one(events, { fields: [registrations.eventId], references: [events.id] }),
  student: one(user, { fields: [registrations.studentId], references: [user.id] })
}));

export const attendanceTokenRelations = relations(attendanceTokens, ({ one }) => ({
  session: one(eventSessions, { fields: [attendanceTokens.eventSessionId], references: [eventSessions.id] })
}));
