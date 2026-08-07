import { TestBed } from '@angular/core/testing';
import '@angular/compiler';

jest.mock('app/entities/dashboard/dashboard-state', () => ({
  DashboardStateService: class DashboardStateService {},
}));

import { DestroyRef, signal } from '@angular/core';
import { of } from 'rxjs';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { LoginService } from 'app/login/login.service';
import { Authority } from 'app/config/authority.constants';
import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { SHELL_NAV_GROUPS, ShellNavGroup } from '../shell-navigation';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let dashboardState: Pick<DashboardStateService, 'currentUser' | 'canAccess'>;
  let accountService: jest.Mocked<Pick<AccountService, 'getAuthenticationState' | 'hasAnyAuthority'>>;
  let destroyCallbacks: Array<() => void>;
  let destroyRef: DestroyRef;
  let loginService: jest.Mocked<Pick<LoginService, 'logout'>>;
  let router: jest.Mocked<Pick<Router, 'navigate'>>;
  let stateStorageService: jest.Mocked<Pick<StateStorageService, 'storeLocale'>>;
  let translateService: jest.Mocked<Pick<TranslateService, 'use'>>;

  const groupNamed = (labelKey: string): ShellNavGroup => SHELL_NAV_GROUPS.find(group => group.labelKey === labelKey)!;
  const adminGroup = (): ShellNavGroup => groupNamed('global.menu.admin.main');
  const operationsGroup = (): ShellNavGroup => groupNamed('global.menu.navigation.operations');

  beforeEach(() => {
    dashboardState = {
      currentUser: signal({ name: 'Admin User', role: 'ADMIN' }),
      canAccess: jest.fn(() => true),
    };
    accountService = {
      getAuthenticationState: jest.fn(() => of(null)),
      hasAnyAuthority: jest.fn((_authorities: string | string[]) => true),
    };
    loginService = { logout: jest.fn() };
    // readonly, matching Router.navigate from Angular 20 onwards.
    router = { navigate: jest.fn((_commands: readonly any[]) => Promise.resolve(true)) };
    stateStorageService = { storeLocale: jest.fn() };
    translateService = { use: jest.fn() } as unknown as jest.Mocked<Pick<TranslateService, 'use'>>;
    destroyCallbacks = [];
    destroyRef = {
      onDestroy(callback: () => void) {
        destroyCallbacks.push(callback);
        return () => {
          destroyCallbacks = destroyCallbacks.filter(cb => cb !== callback);
        };
      },
    } as DestroyRef;
  });

  afterEach(() => {
    destroyCallbacks.forEach(callback => callback());
  });

  // The component takes its dependencies through inject(), so it can't be constructed with them.
  const build = (): SidebarComponent => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardStateService, useValue: dashboardState },
        { provide: AccountService, useValue: accountService },
        { provide: DestroyRef, useValue: destroyRef },
        { provide: LoginService, useValue: loginService },
        { provide: Router, useValue: router },
        { provide: StateStorageService, useValue: stateStorageService },
        { provide: TranslateService, useValue: translateService },
      ],
    });
    return TestBed.runInInjectionContext(() => new SidebarComponent());
  };

  const signedIn = (): SidebarComponent => {
    accountService.getAuthenticationState.mockReturnValue(of({} as never));
    const built = build();
    built.ngOnInit();
    return built;
  };

  it('shows the administration group for administrators', () => {
    accountService.hasAnyAuthority.mockReturnValue(true);

    component = signedIn();

    expect(component.groupVisible(adminGroup())).toBe(true);
    expect(accountService.hasAnyAuthority).toHaveBeenCalledWith([Authority.ADMIN]);
  });

  it('hides the administration group from non-admin users', () => {
    accountService.hasAnyAuthority.mockReturnValue(false);

    component = signedIn();

    expect(component.groupVisible(adminGroup())).toBe(false);
  });

  it('hides every authenticated group while signed out', () => {
    accountService.getAuthenticationState.mockReturnValue(of(null));

    component = build();
    component.ngOnInit();

    expect(component.groupVisible(operationsGroup())).toBe(false);
  });

  // The client-side mirror of the api's read/write split. A group whose items are all filtered out
  // must not leave its heading behind on its own.
  it('drops a group whose items the account cannot read', () => {
    (dashboardState.canAccess as jest.Mock).mockReturnValue(false);

    component = signedIn();

    expect(component.visibleItems(operationsGroup())).toEqual([]);
    expect(component.groupVisible(operationsGroup())).toBe(false);
  });

  it('keeps only the readable items of a partially readable group', () => {
    (dashboardState.canAccess as jest.Mock).mockImplementation((resource: string) => resource === 'MESSAGES');

    component = signedIn();

    expect(component.visibleItems(operationsGroup()).map(item => item.path)).toEqual(['/messages']);
  });

  it('derives two initials from a display name', () => {
    component = signedIn();
    expect(component.userInitials()).toBe('AU');

    (dashboardState.currentUser as ReturnType<typeof signal>).set({ name: 'admin', role: 'ADMIN' });
    expect(component.userInitials()).toBe('AD');
  });

  it('persists the chosen language so it survives a reload', () => {
    component = signedIn();

    component.changeLanguage('fr');

    expect(stateStorageService.storeLocale).toHaveBeenCalledWith('fr');
    expect(translateService.use).toHaveBeenCalledWith('fr');
  });

  it('signs out and returns to the root route', () => {
    component = signedIn();

    component.logout();

    expect(loginService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['']);
  });
});
