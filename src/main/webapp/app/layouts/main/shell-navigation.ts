import { Authority } from 'app/config/authority.constants';
import { AppResource } from 'app/entities/dashboard/dashboard-state';

/**
 * Navigation model for the BridgeCare shell (sidebar + topbar).
 *
 * Single source of truth for what appears in the sidebar groups and how the topbar derives its
 * crumb. It mirrors hc-professional/web's `layouts/sidebar/shell-navigation.ts` — same shape, same
 * role — so the two shells stay recognisably one design.
 *
 * Two independent gates apply, and an item may carry either, both, or neither:
 *
 * - `resource` runs through {@link DashboardStateService.canAccess}, the client-side mirror of the
 *   api's read/write split (admin everything, operator GET, plain user nothing). It hides controls;
 *   the server still decides.
 * - `authorities` runs through `AccountService.hasAnyAuthority`.
 *
 * The topbar title is NOT taken from here. Every route in app.routes.ts already declares a
 * translated `title`, so the shell reads that and this model only supplies the crumb above it —
 * which keeps one label per screen rather than two that can disagree.
 */
export interface ShellNavItem {
  /** Absolute router path. */
  path: string;
  labelKey: string;
  /** Material icon name. */
  icon: string;
  /** Match only the exact URL (for `/`). */
  exact?: boolean;
  /** Gated through DashboardStateService.canAccess(resource, 'READ'). */
  resource?: AppResource;
  /** Gated through AccountService.hasAnyAuthority. */
  authorities?: string[];
  dataCy?: string;
}

export interface ShellNavGroup {
  labelKey: string;
  items: ShellNavItem[];
  /** Restrict the whole group to these authorities. */
  authorities?: string[];
  requiresAuth?: boolean;
  dataCy?: string;
}

/**
 * NOTE ON PATHS: the operational screens use the PLURAL paths — see the comment on app.routes.ts.
 * The singular ones are the generated CRUD, reached from the topbar's entity menu, and the two
 * sets are deliberately different screens. A `/dashboard` here would silently land on the wrong one.
 */
export const SHELL_NAV_GROUPS: ShellNavGroup[] = [
  {
    labelKey: 'global.menu.navigation.operations',
    requiresAuth: true,
    dataCy: 'operationsMenu',
    items: [
      {
        path: '/dashboards',
        labelKey: 'global.menu.navigation.dashboard',
        icon: 'space_dashboard',
        resource: 'DASHBOARD',
        dataCy: 'dashboardMenu',
      },
      { path: '/messages', labelKey: 'global.menu.navigation.messages', icon: 'chat', resource: 'MESSAGES', dataCy: 'messagesMenu' },
      {
        path: '/duty-rosters',
        labelKey: 'global.menu.navigation.dutyRosters',
        icon: 'calendar_month',
        resource: 'DUTY_ROSTER',
        dataCy: 'dutyRosterMenu',
      },
    ],
  },
  {
    labelKey: 'global.menu.navigation.catalogue',
    requiresAuth: true,
    dataCy: 'catalogueMenu',
    items: [
      { path: '/pricing-plans', labelKey: 'global.menu.navigation.pricingPlans', icon: 'subscriptions', resource: 'PRICE_PLANS' },
      { path: '/catalog', labelKey: 'global.menu.navigation.catalog', icon: 'auto_stories', resource: 'CATALOG' },
      { path: '/facilities', labelKey: 'global.menu.navigation.facilities', icon: 'local_hospital', resource: 'FACILITIES' },
    ],
  },
  {
    labelKey: 'global.menu.navigation.organisation',
    requiresAuth: true,
    dataCy: 'organisationMenu',
    items: [
      { path: '/teams', labelKey: 'global.menu.navigation.teams', icon: 'groups', resource: 'TEAMS' },
      { path: '/profiles', labelKey: 'global.menu.navigation.profiles', icon: 'people', resource: 'PROFILES' },
    ],
  },
  {
    labelKey: 'global.menu.admin.main',
    authorities: [Authority.ADMIN],
    dataCy: 'adminMenu',
    items: [
      { path: '/admin/dashboard', labelKey: 'global.menu.admin.dashboard', icon: 'admin_panel_settings', dataCy: 'systemAdminMenu' },
      { path: '/admin/user-management', labelKey: 'global.menu.admin.userManagement', icon: 'manage_accounts' },
      { path: '/admin/metrics', labelKey: 'global.menu.admin.metrics', icon: 'monitoring' },
      { path: '/admin/health', labelKey: 'global.menu.admin.health', icon: 'favorite' },
      { path: '/admin/configuration', labelKey: 'global.menu.admin.configuration', icon: 'settings' },
      { path: '/admin/logs', labelKey: 'global.menu.admin.logs', icon: 'receipt_long' },
    ],
  },
  {
    labelKey: 'global.menu.account.main',
    requiresAuth: true,
    dataCy: 'accountMenu',
    items: [
      { path: '/account/settings', labelKey: 'global.menu.account.settings', icon: 'build', dataCy: 'settings' },
      { path: '/account/password', labelKey: 'global.menu.account.password', icon: 'lock', dataCy: 'passwordItem' },
    ],
  },
];

const flatItems = (): ShellNavItem[] => SHELL_NAV_GROUPS.flatMap(group => group.items);

/** The URL with its query string and fragment stripped; `/teams?page=2#top` -> `/teams`. */
const routePath = (url: string): string => url.split(/[?#]/)[0] ?? '/';

/**
 * Longest-prefix match of the current URL against the nav items, paired with the group it belongs
 * to; drives the topbar crumb. Longest-prefix rather than first-match because `/admin/dashboard`
 * and `/dashboards` would otherwise be ambiguous.
 */
export const findShellNavGroup = (url: string): ShellNavGroup | null => {
  const path = routePath(url);
  let best: { group: ShellNavGroup; length: number } | null = null;
  for (const group of SHELL_NAV_GROUPS) {
    for (const item of group.items) {
      const matches = item.exact ? path === item.path : path === item.path || path.startsWith(`${item.path}/`);
      if (matches && (!best || item.path.length > best.length)) {
        best = { group, length: item.path.length };
      }
    }
  }
  return best?.group ?? null;
};

export const findShellNavItem = (url: string): ShellNavItem | null => {
  const path = routePath(url);
  let best: ShellNavItem | null = null;
  for (const item of flatItems()) {
    const matches = item.exact ? path === item.path : path === item.path || path.startsWith(`${item.path}/`);
    if (matches && (!best || item.path.length > best.path.length)) {
      best = item;
    }
  }
  return best;
};
