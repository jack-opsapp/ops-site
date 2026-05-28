import type { Redirect } from 'next/dist/lib/load-custom-routes';

export const seoRedirects: Redirect[] = [
  // ── Bubble infrastructure ────────────────────────────────────────────
  { source: '/version-test', destination: '/', statusCode: 301 },
  { source: '/version-test/:path*', destination: '/', statusCode: 301 },
  { source: '/locale-tools', destination: '/', statusCode: 301 },
  { source: '/package/:path*', destination: '/', statusCode: 301 },

  // ── Blog → Journal (pre-migration paths used in emails & structured data) ──
  { source: '/blog', destination: '/journal', statusCode: 301 },
  { source: '/blog/:slug', destination: '/journal/:slug', statusCode: 301 },
  { source: '/post', destination: '/journal', statusCode: 301 },
  { source: '/field-notes', destination: '/journal', statusCode: 301 },
  { source: '/field-notes/:slug', destination: '/journal', statusCode: 301 },

  // ── Auth / signup / login → app.opsapp.co ────────────────────────────
  { source: '/login', destination: 'https://app.opsapp.co/login', statusCode: 301 },
  { source: '/signup', destination: 'https://app.opsapp.co/register', statusCode: 301 },
  { source: '/sign_up', destination: 'https://app.opsapp.co/register', statusCode: 301 },
  { source: '/register', destination: 'https://app.opsapp.co/register', statusCode: 301 },
  { source: '/join', destination: 'https://app.opsapp.co/join', statusCode: 301 },
  { source: '/join/:path*', destination: 'https://app.opsapp.co/join/:path*', statusCode: 301 },
  { source: '/auth/:path*', destination: 'https://app.opsapp.co/auth/:path*', statusCode: 301 },
  { source: '/open', destination: 'https://app.opsapp.co/open', statusCode: 301 },

  // ── App routes → app.opsapp.co ──────────────────────────────────────
  { source: '/dashboard', destination: 'https://app.opsapp.co/dashboard', statusCode: 301 },
  { source: '/projects', destination: 'https://app.opsapp.co/projects', statusCode: 301 },
  { source: '/projects/:path*', destination: 'https://app.opsapp.co/projects/:path*', statusCode: 301 },
  { source: '/settings', destination: 'https://app.opsapp.co/settings', statusCode: 301 },
  { source: '/settings/:path*', destination: 'https://app.opsapp.co/settings/:path*', statusCode: 301 },
  { source: '/inbox', destination: 'https://app.opsapp.co/inbox', statusCode: 301 },
  { source: '/admin/:path*', destination: 'https://app.opsapp.co/admin/:path*', statusCode: 301 },
  { source: '/portal/:path*', destination: 'https://app.opsapp.co/portal/:path*', statusCode: 301 },
  { source: '/team/:path*', destination: 'https://app.opsapp.co/team/:path*', statusCode: 301 },
  { source: '/agent/:path*', destination: 'https://app.opsapp.co/agent/:path*', statusCode: 301 },
  { source: '/app', destination: 'https://app.opsapp.co/dashboard', statusCode: 301 },

  // ── Renamed product: Tailored → SPEC ────────────────────────────────
  { source: '/tailored', destination: '/spec', statusCode: 301 },
  { source: '/tailored/:path*', destination: '/spec/:path*', statusCode: 301 },

  // ── Legal ───────────────────────────────────────────────────────────
  { source: '/privacy', destination: '/legal?page=privacy', statusCode: 301 },
  { source: '/terms', destination: '/legal?page=terms', statusCode: 301 },
  { source: '/eula', destination: '/legal?page=eula', statusCode: 301 },
  { source: '/policy', destination: '/legal?page=privacy', statusCode: 301 },

  // ── Bubble sitemap pages (from canprojack.bubbleapps.io sitemap) ─────
  { source: '/ops_app', destination: '/platform', statusCode: 301 },
  { source: '/ops_advantage', destination: '/platform', statusCode: 301 },
  { source: '/ops_evolution', destination: '/platform', statusCode: 301 },
  { source: '/ops_why', destination: '/company', statusCode: 301 },
  { source: '/ops_pricing', destination: '/plans', statusCode: 301 },
  { source: '/join_ops', destination: '/plans', statusCode: 301 },
  { source: '/blog_post', destination: '/journal', statusCode: 301 },

  // Bubble blog posts whose content was NOT migrated to a live journal post.
  // Without these explicit overrides the catch-all below would 301 each to
  // /journal/<slug> — a non-existent route — producing 301-to-404 chains
  // visible in Search Console (verified May 2026 GSC pull). Each redirect
  // here targets the closest surviving article by topic.
  //
  // Audit 2026-05-28: pulled every is_live=false slug from Supabase
  // blog_posts and mapped each to its nearest live cousin. Twenty draft
  // slugs added below. Real-article drafts redirect to topically-related
  // live posts; in-app help-style drafts (calendar--scheduling,
  // dashboard--reporting, etc.) redirect to /resources.
  // If a future draft is published live with its own /journal/<slug>,
  // remove its row here so the catch-all takes over again.
  { source: '/blog_post/client-management', destination: '/journal/craft-a-6-star-experience', statusCode: 301 },
  { source: '/blog_post/team-coordination--role-management', destination: '/journal/building-self-sufficient-crews', statusCode: 301 },
  { source: '/blog_post/make-smart-decisions-on-the-job-site', destination: '/journal/use-inversion-to-avoid-job-site-failures', statusCode: 301 },
  { source: '/blog_post/dashboard--reporting', destination: '/journal/track-job-costs-like-a-pro', statusCode: 301 },

  // Article-style drafts → closest live cousin
  { source: '/blog_post/are-you-successful-for-your-age', destination: '/journal/the-die-with-zero-approach', statusCode: 301 },
  { source: '/blog_post/diesel-up-50-shield-your-margin', destination: '/journal/tariff-proof-your-next-bid', statusCode: 301 },
  { source: '/blog_post/essential-guide-for-blue-collar-truck-buyers', destination: '/journal/top-5-pickups-of-2025', statusCode: 301 },
  { source: '/blog_post/handling-emergency-calls-without-derailing-your-entire-day', destination: '/journal/how-to-handle-difficult-site-management', statusCode: 301 },
  { source: '/blog_post/how-to-work-effectively-with-other-trades', destination: '/journal/the-hidden-communication-gap-between-office-and-field-teams', statusCode: 301 },
  { source: '/blog_post/job-site-communication-eliminating-costly-mistakes-without-endless-meetings', destination: '/journal/the-hidden-communication-gap-between-office-and-field-teams', statusCode: 301 },
  { source: '/blog_post/milwaukee-s-latest-tools', destination: '/journal/top-5-pickups-of-2025', statusCode: 301 },
  { source: '/blog_post/the-milwaukee-one-key-system', destination: '/journal/top-5-pickups-of-2025', statusCode: 301 },
  { source: '/blog_post/the-real-cost-of-inefficiency', destination: '/journal/profit-first-for-trades', statusCode: 301 },
  { source: '/blog_post/top-challenges-for-contractors-in-western-canada', destination: '/journal/tariff-proof-your-next-bid', statusCode: 301 },
  { source: '/blog_post/your-reviews-run-your-business', destination: '/journal/craft-a-6-star-experience', statusCode: 301 },

  // In-app help-style drafts → /resources (not blog-grade content)
  { source: '/blog_post/calendar--scheduling', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/company-administration-admin-only', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/daily-workflow', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/getting-started--setup', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/phone-use-guide', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/project--task-details', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/project-creation--management', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/status-updates--notes', destination: '/resources', statusCode: 301 },
  { source: '/blog_post/troubleshooting', destination: '/resources', statusCode: 301 },

  // Malformed slug (double-hyphen typo `2025--construction`) → fixed slug
  { source: '/journal/understanding-the-2025--construction-tech-landscape', destination: '/journal/understanding-the-2025-construction-tech-landscape', statusCode: 301 },

  { source: '/blog_post/:slug', destination: '/journal/:slug', statusCode: 301 },
  { source: '/10_minute_test', destination: '/tools/leadership', statusCode: 301 },
  { source: '/leadershipanalysis', destination: '/tools/leadership', statusCode: 301 },
  { source: '/ai_seo_analyze', destination: '/tools', statusCode: 301 },
  { source: '/thanks', destination: '/', statusCode: 301 },
  { source: '/sitemap', destination: '/sitemap.xml', statusCode: 301 },

  // ── Other guessable / common paths ──────────────────────────────────
  { source: '/pricing', destination: '/plans', statusCode: 301 },
  { source: '/features', destination: '/platform', statusCode: 301 },
  { source: '/about', destination: '/company', statusCode: 301 },
  { source: '/contact', destination: '/company', statusCode: 301 },
  { source: '/home', destination: '/', statusCode: 301 },
  { source: '/index', destination: '/', statusCode: 301 },
  { source: '/landing', destination: '/', statusCode: 301 },
  { source: '/download', destination: '/plans', statusCode: 301 },
  { source: '/get-started', destination: '/plans', statusCode: 301 },
  { source: '/demo', destination: '/platform', statusCode: 301 },

  // ── Support / resources ─────────────────────────────────────────────
  { source: '/support', destination: '/resources', statusCode: 301 },
  { source: '/tutorial-intro', destination: '/resources', statusCode: 301 },

  // ── Email unsubscribe (not permanent — may change) ──────────────────
  { source: '/unsubscribe', destination: 'https://app.opsapp.co/api/email/unsubscribe', permanent: false },
];
