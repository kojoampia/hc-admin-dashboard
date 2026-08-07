import { Authority } from 'app/config/authority.constants';
import { SHELL_NAV_GROUPS, findShellNavGroup, findShellNavItem } from './shell-navigation';

describe('shell navigation', () => {
  it('gates the administration group on ROLE_ADMIN', () => {
    const admin = SHELL_NAV_GROUPS.find(group => group.labelKey === 'global.menu.admin.main');

    expect(admin?.authorities).toEqual([Authority.ADMIN]);
  });

  it('routes every operational item through a canAccess resource', () => {
    const gated = SHELL_NAV_GROUPS.filter(group =>
      ['global.menu.navigation.operations', 'global.menu.navigation.catalogue', 'global.menu.navigation.organisation'].includes(
        group.labelKey,
      ),
    ).flatMap(group => group.items);

    expect(gated.length).toBeGreaterThan(0);
    expect(gated.every(item => item.resource !== undefined)).toBe(true);
  });

  // The plural/singular split in app.routes.ts is load-bearing: /dashboards is the hand-written
  // screen, /dashboard is the generated CRUD, and only the plural belongs in the sidebar.
  it('points the operational items at the plural paths', () => {
    const operations = SHELL_NAV_GROUPS.find(group => group.labelKey === 'global.menu.navigation.operations');

    expect(operations?.items.map(item => item.path)).toEqual(['/dashboards', '/messages', '/duty-rosters']);
  });

  describe('crumb resolution', () => {
    it('matches child routes of an item', () => {
      expect(findShellNavGroup('/teams/42/edit')?.labelKey).toBe('global.menu.navigation.organisation');
    });

    it('ignores the query string and fragment', () => {
      expect(findShellNavGroup('/profiles?page=2#top')?.labelKey).toBe('global.menu.navigation.organisation');
    });

    // `/admin/dashboard` must not be captured by `/dashboards`, nor the reverse. Longest-prefix,
    // not first-match, is what keeps those two apart.
    it('prefers the longest matching path', () => {
      expect(findShellNavItem('/admin/dashboard')?.path).toBe('/admin/dashboard');
      expect(findShellNavGroup('/admin/dashboard')?.labelKey).toBe('global.menu.admin.main');
      expect(findShellNavGroup('/dashboards')?.labelKey).toBe('global.menu.navigation.operations');
    });

    it('returns null for a route outside the sidebar', () => {
      expect(findShellNavGroup('/login')).toBeNull();
      expect(findShellNavItem('/login')).toBeNull();
    });

    // A prefix match must respect path segments: `/team-archive` is not a child of `/teams`.
    it('does not match a path that merely starts with the same characters', () => {
      expect(findShellNavItem('/teams-archive')).toBeNull();
    });
  });
});
