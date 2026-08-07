import { TestBed } from '@angular/core/testing';
import '@angular/compiler';

import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { Authority } from 'app/config/authority.constants';
import { UserManagementService } from '../user-management/service/user-management.service';
import { IUser } from '../user-management/user-management.model';
import AccessControlComponent from './access-control';

describe('AccessControlComponent', () => {
  let component: AccessControlComponent;
  let accountService: jest.Mocked<Pick<AccountService, 'identity'>>;
  let userManagementService: jest.Mocked<Pick<UserManagementService, 'query' | 'authorities'>>;
  let changeDetectorRef: jest.Mocked<Pick<ChangeDetectorRef, 'markForCheck'>>;

  beforeEach(() => {
    accountService = {
      identity: jest.fn(),
    };
    userManagementService = {
      query: jest.fn(),
      authorities: jest.fn(),
    };
    changeDetectorRef = {
      markForCheck: jest.fn(),
    };

      // The component takes its dependencies through inject() now, so it can no longer be
      // constructed with them. TestBed supplies the same doubles through the injector; the
      // mocks and every assertion below are unchanged.
    TestBed.configureTestingModule({
      providers: [
        { provide: AccountService, useValue: accountService },
        { provide: UserManagementService, useValue: userManagementService },
        { provide: ChangeDetectorRef, useValue: changeDetectorRef },
      ],
    });
    component = TestBed.runInInjectionContext(() => new AccessControlComponent());
  });

  it('builds access coverage from the current account and admin APIs', () => {
    accountService.identity.mockReturnValue(
      of(new Account(true, [Authority.ADMIN, Authority.USER], 'admin@example.com', 'Admin', 'en', 'User', 'admin', null)),
    );
    userManagementService.query.mockReturnValue(
      of(
        new HttpResponse<IUser[]>({
          body: [
            createUser({ id: '1', activated: true, authorities: [Authority.ADMIN] }),
            createUser({ id: '2', activated: true, authorities: [Authority.USER] }),
            createUser({ id: '3', activated: false, authorities: [Authority.ADMIN] }),
          ],
          headers: new HttpHeaders({ 'X-Total-Count': '3' }),
        }),
      ),
    );
    userManagementService.authorities.mockReturnValue(of([{ name: Authority.USER }, { name: Authority.ADMIN }]));

    component.ngOnInit();

    expect(component.currentHasAdminAccess).toBe(true);
    expect(component.currentLogin).toBe('admin');
    expect(component.adminUserCount).toBe(2);
    expect(component.activeAdminUserCount).toBe(1);
    expect(component.totalManagedUsers).toBe(3);
    expect(component.protectedRoutes.every(route => route.accessGranted)).toBe(true);
    expect(component.availableAuthorities).toEqual([{ name: Authority.USER }, { name: Authority.ADMIN }]);
  });

  it('surfaces permission failures from the access APIs', () => {
    accountService.identity.mockReturnValue(of(null));
    userManagementService.query.mockReturnValue(
      throwError(() => ({
        status: 403,
      })),
    );
    userManagementService.authorities.mockReturnValue(of([{ name: Authority.USER }]));

    component.ngOnInit();

    expect(component.errorMessage).toBe('You do not have access to review dashboard permissions.');
    expect(component.isLoading).toBe(false);
  });
});

function createUser(overrides: Partial<IUser>): IUser {
  return {
    id: overrides.id ?? 'user-id',
    login: overrides.login ?? 'user',
    activated: overrides.activated ?? false,
    authorities: overrides.authorities ?? [Authority.USER],
    ...overrides,
  };
}
