import '@angular/compiler';

jest.mock('app/entities/dashboard/dashboard-state', () => ({
  DashboardStateService: class DashboardStateService {},
}));

import { DestroyRef, signal } from '@angular/core';
import { of } from 'rxjs';

import { Router } from '@angular/router';

import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { Authority } from 'app/config/authority.constants';
import type { DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let dashboardState: Pick<DashboardStateService, 'sidebarExpanded' | 'currentUser' | 'canAccess' | 'setMenu' | 'toggleSidebar'>;
  let accountService: jest.Mocked<Pick<AccountService, 'getAuthenticationState' | 'hasAnyAuthority'>>;
  let destroyCallbacks: Array<() => void>;
  let destroyRef: DestroyRef;
  let loginService: jest.Mocked<Pick<LoginService, 'logout'>>;
  let router: jest.Mocked<Pick<Router, 'navigate'>>;

  beforeEach(() => {
    dashboardState = {
      sidebarExpanded: signal(true),
      currentUser: signal({ name: 'Admin User', role: 'ADMIN' }),
      canAccess: jest.fn(() => true),
      setMenu: jest.fn(),
      toggleSidebar: jest.fn(),
    };
    accountService = {
      getAuthenticationState: jest.fn(() => of(null)),
      hasAnyAuthority: jest.fn((_authorities: string | string[]) => true),
    };
    loginService = { logout: jest.fn() };
    router = { navigate: jest.fn((_commands: any[]) => Promise.resolve(true)) };
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

  it('shows the System Admin link for administrators', () => {
    accountService.getAuthenticationState.mockReturnValue(of({} as never));
    accountService.hasAnyAuthority.mockReturnValue(true);

    component = new SidebarComponent(
      dashboardState as DashboardStateService,
      accountService as unknown as AccountService,
      destroyRef,
      loginService as unknown as LoginService,
      router as unknown as Router,
    );
    component.ngOnInit();

    expect(accountService.hasAnyAuthority).toHaveBeenCalledWith(Authority.ADMIN);
    expect(component.showSystemAdminLink).toBe(true);
  });

  it('hides the System Admin link for non-admin users', () => {
    accountService.getAuthenticationState.mockReturnValue(of({} as never));
    accountService.hasAnyAuthority.mockReturnValue(false);

    component = new SidebarComponent(
      dashboardState as DashboardStateService,
      accountService as unknown as AccountService,
      destroyRef,
      loginService as unknown as LoginService,
      router as unknown as Router,
    );
    component.ngOnInit();

    expect(component.showSystemAdminLink).toBe(false);
  });
});
