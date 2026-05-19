jest.mock('app/entities/dashboard/dashboard-state', () => ({
  DashboardStateService: class DashboardStateService {},
}));

import '@angular/compiler';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { Authority } from 'app/config/authority.constants';
import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let accountService: jest.Mocked<Pick<AccountService, 'getAuthenticationState' | 'hasAnyAuthority'>>;

  const dashboardState = {
    sidebarExpanded: signal(true),
    currentUser: signal({ name: 'Admin User', role: 'ADMIN' }),
    canAccess: jest.fn(() => true),
    setMenu: jest.fn(),
    toggleSidebar: jest.fn(),
  };

  beforeEach(async () => {
    accountService = {
      getAuthenticationState: jest.fn(() => of(createAccount([Authority.ADMIN]))),
      hasAnyAuthority: jest.fn((_authorities: string | string[]) => true),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule, SidebarComponent],
      providers: [
        { provide: DashboardStateService, useValue: dashboardState },
        { provide: AccountService, useValue: accountService },
      ],
    }).compileComponents();
  });

  it('shows the System Admin link for administrators', () => {
    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('SYSTEM ADMIN');
  });

  it('hides the System Admin link for non-admin users', () => {
    accountService.getAuthenticationState.mockReturnValue(of(createAccount([Authority.USER])));
    accountService.hasAnyAuthority.mockReturnValue(false);

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('SYSTEM ADMIN');
  });
});

function createAccount(authorities: string[]): Account {
  return new Account(true, authorities, 'admin@healthconnect.com', 'Admin', 'en', 'User', 'admin', null);
}
