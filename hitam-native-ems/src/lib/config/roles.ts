export type NavSlot = {
  label: string;
  href: string;
  icon: string;
  isHero?: boolean;
};

export type RoleConfig = {
  theme: {
    accent: string;
    text: string;
    colorName: string; // Tailwind color name (e.g., 'emerald')
  };
  icons: {
    header: string;
    metric1: string;
    metric2: string;
    metric3: string;
  };
  labels: {
    metric1: string;
    metric2: string;
    metric3: string;
  };
  navigation: NavSlot[];
  actions: Array<{ label: string, href: string, icon: string, key: string }>;
};

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  STUDENT: {
    theme: { accent: "bg-[#2E7D32]", text: "text-[#2E7D32]", colorName: "emerald" },
    icons: { header: "school", metric1: "campaign", metric2: "workspace_premium", metric3: "settings_accessibility" },
    labels: { metric1: "Active Campus Events", metric2: "Affinity Score", metric3: "Upcoming Sessions" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Explore", icon: "explore", href: "/explore" },
      { label: "Scan", icon: "qr_code_scanner", href: "/scanner", isHero: true },
      { label: "My Events", icon: "event_note", href: "/my-events" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "Browse Events", href: "/events", icon: "search", key: "action-1" },
      { label: "My Registrations", href: "/my-events", icon: "how_to_reg", key: "action-2" },
      { label: "Scan QR", href: "/scanner", icon: "qr_code_scanner", key: "action-3" },
      { label: "Attendance Timeline", href: "/attendance/history", icon: "history", key: "action-4" }
    ]
  },
  STUDENT_COORDINATOR: {
    theme: { accent: "bg-[#10b981]", text: "text-[#10b981]", colorName: "amber" },
    icons: { header: "sports_cricket", metric1: "bolt", metric2: "group", metric3: "calendar_month" },
    labels: { metric1: "Active Sessions", metric2: "Total Registrations", metric3: "Upcoming Events" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Analytics", icon: "analytics", href: "/analytics" },
      { label: "Create", icon: "add_circle_outline", href: "/events/create", isHero: true },
      { label: "My Events", icon: "event_note", href: "/my-events" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "New Event (W-A)", href: "/events/create", icon: "add", key: "action-1" },
      { label: "Manage Attendance", href: "/attendance/manage", icon: "checklist", key: "action-2" },
      { label: "View Analytics", href: "/analytics", icon: "bar_chart", key: "action-3" }
    ]
  },
  FACULTY: {
    theme: { accent: "bg-[#2b6cee]", text: "text-[#2b6cee]", colorName: "blue" },
    icons: { header: "person_4", metric1: "bolt", metric2: "rate_review", metric3: "calendar_month" },
    labels: { metric1: "Live Technicals", metric2: "Pending Approvals", metric3: "Upcoming Events" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Classes", icon: "view_list", href: "/attendance" },
      { label: "Attendance", icon: "how_to_reg", href: "/attendance/erp", isHero: true },
      { label: "My Events", icon: "event_note", href: "/my-events" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "Submit ERP Attendance", href: "/attendance/erp", icon: "fact_check", key: "action-1" },
      { label: "New Tech Event (W-B)", href: "/events/create?type=technical", icon: "add", key: "action-2" },
      { label: "Review Approvals", href: "/approvals", icon: "rate_review", key: "action-3" }
    ]
  },
  PROGRAM_HEAD: {
    theme: { accent: "bg-[#6366f1]", text: "text-[#6366f1]", colorName: "indigo" },
    icons: { header: "account_balance", metric1: "bolt", metric2: "rule", metric3: "calendar_month" },
    labels: { metric1: "Dept Active Sessions", metric2: "Pending Approvals", metric3: "Dept Upcoming Events" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Analytics", icon: "monitoring", href: "/analytics" },
      { label: "Verify", icon: "verified_user", href: "/approvals", isHero: true },
      { label: "Calendar", icon: "calendar_month", href: "/calendar" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "Approve Events", href: "/approvals", icon: "verified", key: "action-1" },
      { label: "Dept Calendar", href: "/calendar/dept", icon: "calendar_month", key: "action-2" },
      { label: "Verify Attendance", href: "/approvals/attendance", icon: "fact_check", key: "action-3" }
    ]
  },
  HOD: {
    theme: { accent: "bg-[#1e3a8a]", text: "text-[#1e3a8a]", colorName: "purple" },
    icons: { header: "business_center", metric1: "summarize", metric2: "insights", metric3: "calendar_today" },
    labels: { metric1: "W-B Final Overviews", metric2: "Overall Participation", metric3: "Monthly Cycles" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Analytics", icon: "insights", href: "/analytics" },
      { label: "Reports", icon: "summarize", href: "/reports", isHero: true },
      { label: "Calendar", icon: "calendar_month", href: "/calendar" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "Monthly Reports", href: "/reports/monthly", icon: "assignment", key: "action-1" },
      { label: "Review Workflow C", href: "/approvals", icon: "flaky", key: "action-2" },
      { label: "HOD Calendar", href: "/calendar/hod", icon: "event", key: "action-3" }
    ]
  },
  LEAD_SE: {
    theme: { accent: "bg-[#f59e0b]", text: "text-[#f59e0b]", colorName: "orange" },
    icons: { header: "hub", metric1: "approval", metric2: "campaign", metric3: "settings_accessibility" },
    labels: { metric1: "W-A Club Approvals", metric2: "Institute Events", metric3: "Affinity Engagement" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Analytics", icon: "campaign", href: "/analytics" },
      { label: "Review", icon: "task_alt", href: "/approvals", isHero: true },
      { label: "My Events", icon: "event_note", href: "/my-events" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "Review Club Events", href: "/approvals", icon: "rate_review", key: "action-1" },
      { label: "Institute Calendar", href: "/calendar/institute", icon: "event", key: "action-2" },
      { label: "Manage Affinity", href: "/affinity", icon: "star", key: "action-3" }
    ]
  },
  AO: {
    theme: { accent: "bg-[#8b5cf6]", text: "text-[#8b5cf6]", colorName: "rose" },
    icons: { header: "meeting_room", metric1: "roofing", metric2: "event_busy", metric3: "notifications_active" },
    labels: { metric1: "Allocation Queue", metric2: "Room Conflicts", metric3: "Campus Alerts" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Rooms", icon: "grid_view", href: "/venues/schedule" },
      { label: "Alloc", icon: "dynamic_feed", href: "/venues/queue", isHero: true },
      { label: "Venues", icon: "meeting_room", href: "/venues" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "Venue Matrix", href: "/venues", icon: "grid_view", key: "action-1" },
      { label: "Process Queue", href: "/venues/queue", icon: "checklist", key: "action-2" },
      { label: "Resolve Conflicts", href: "/venues/conflicts", icon: "warning", key: "action-3" }
    ]
  },
  ADMIN: {
    theme: { accent: "bg-[#0f172a]", text: "text-[#0f172a]", colorName: "slate" },
    icons: { header: "admin_panel_settings", metric1: "manage_accounts", metric2: "security", metric3: "receipt_long" },
    labels: { metric1: "Active Users", metric2: "System Flags", metric3: "Audit Timeline" },
    navigation: [
      { label: "Home", icon: "home", href: "/dashboard" },
      { label: "Users", icon: "person_search", href: "/admin/users" },
      { label: "Security", icon: "admin_panel_settings", href: "/admin/security", isHero: true },
      { label: "Settings", icon: "settings", href: "/settings" },
      { label: "Profile", icon: "person", href: "/profile" },
    ],
    actions: [
      { label: "Manage Users", href: "/admin/users", icon: "people", key: "action-1" },
      { label: "Global Settings", href: "/admin/settings", icon: "settings", key: "action-2" },
      { label: "System Logs", href: "/admin/audit", icon: "history", key: "action-3" }
    ]
  }
};
