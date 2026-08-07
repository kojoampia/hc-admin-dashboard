import { TestBed } from '@angular/core/testing';
import '@angular/compiler';

import { DestroyRef } from '@angular/core';
import { of } from 'rxjs';

import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { DashboardLayoutService, DashboardWidgetLayout } from './dashboard-layout.service';

(globalThis as { REALTIME_ENABLED?: boolean }).REALTIME_ENABLED = false;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DashboardComponent = require('./dashboard-component').default as typeof import('./dashboard-component').default;

describe('DashboardComponent', () => {
  let component: InstanceType<typeof DashboardComponent>;
  let accountService: jest.Mocked<Pick<AccountService, 'identity'>>;
  let dashboardLayoutService: {
    widgets: jest.Mock<DashboardWidgetLayout[], []>;
    setWidgetVisibility: jest.Mock;
  };
  let destroyCallbacks: Array<() => void>;
  let destroyRef: DestroyRef;

  beforeEach(() => {
    accountService = {
      identity: jest.fn(() => of(new Account(true, ['ROLE_ADMIN'], 'admin@example.com', 'Admin', 'en', 'User', 'admin', null))),
    };
    dashboardLayoutService = {
      widgets: jest.fn(() => [
        createWidget('userActivity', true),
        createWidget('customizableLayout', true),
        createWidget('dataExport', false),
      ]),
      setWidgetVisibility: jest.fn(),
    };
    destroyCallbacks = [];
    destroyRef = {
      onDestroy(callback: () => void) {
        destroyCallbacks.push(callback);
        return () => {
          destroyCallbacks = destroyCallbacks.filter(cb => cb !== callback);
        };
      },
    } as DestroyRef;

      // The component takes its dependencies through inject() now, so it can no longer be
      // constructed with them. TestBed supplies the same doubles through the injector; the
      // mocks and every assertion below are unchanged.
    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardLayoutService, useValue: dashboardLayoutService },
        { provide: AccountService, useValue: accountService },
        { provide: DestroyRef, useValue: destroyRef },
      ],
    });
    component = TestBed.runInInjectionContext(() => new DashboardComponent());
    jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: jest.fn(),
    } as unknown as HTMLElement);
  });

  afterEach(() => {
    destroyCallbacks.forEach(callback => callback());
    jest.restoreAllMocks();
  });

  it('loads the current account and manages widget window controls', () => {
    component.ngOnInit();

    expect(component.currentUserName()).toBe('Admin User');
    expect(component.currentUserRole()).toBe('Administrator');
    expect(component.visibleWidgetCount()).toBe(2);
    expect(component.hiddenWidgetCount()).toBe(1);

    component.openWidget('dataExport');
    expect(dashboardLayoutService.setWidgetVisibility).toHaveBeenCalledWith('dataExport', true);
    expect(component.maximizedWidgetId()).toBe('dataExport');

    component.toggleMinimizeWidget('userActivity');
    expect(component.isWidgetMinimized('userActivity')).toBe(true);

    component.toggleMaximizeWidget('userActivity');
    expect(component.isWidgetMaximized('userActivity')).toBe(true);

    component.closeWidget('userActivity');
    expect(dashboardLayoutService.setWidgetVisibility).toHaveBeenCalledWith('userActivity', false);
  });
});

function createWidget(id: DashboardWidgetLayout['id'], visible: boolean): DashboardWidgetLayout {
  return {
    id,
    title: id,
    description: `${id} description`,
    icon: 'dashboard',
    span: 'single',
    visible,
  };
}
