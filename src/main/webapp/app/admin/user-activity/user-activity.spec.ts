import { TestBed } from '@angular/core/testing';
import '@angular/compiler';

import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserManagementService } from '../user-management/service/user-management.service';
import { IUser } from '../user-management/user-management.model';
import UserActivityComponent from './user-activity';

describe('UserActivityComponent', () => {
  let component: UserActivityComponent;
  let userManagementService: jest.Mocked<Pick<UserManagementService, 'query'>>;

  beforeEach(() => {
    userManagementService = {
      query: jest.fn(),
    };

      // The component takes its dependencies through inject() now, so it can no longer be
      // constructed with them. TestBed supplies the same doubles through the injector; the
      // mocks and every assertion below are unchanged.
    TestBed.configureTestingModule({
      providers: [
        { provide: UserManagementService, useValue: userManagementService },
      ],
    });
    component = TestBed.runInInjectionContext(() => new UserActivityComponent());
  });

  it('builds user activity insights from the admin users endpoint', () => {
    userManagementService.query.mockReturnValue(
      of(
        new HttpResponse<IUser[]>({
          body: [
            createUser({ id: '1', activated: true, authorities: ['ROLE_ADMIN'], createdDate: new Date() }),
            createUser({ id: '2', activated: true, authorities: ['ROLE_USER'] }),
            createUser({ id: '3', activated: false, authorities: ['ROLE_USER'] }),
          ],
          headers: new HttpHeaders({ 'X-Total-Count': '3' }),
        }),
      ),
    );

    component.ngOnInit();

    expect(component.totalUsers).toBe(3);
    expect(component.activeUsers).toBe(2);
    expect(component.inactiveUsers).toBe(1);
    expect(component.adminUsers).toBe(1);
    expect(component.recentUsers).toBe(1);
    expect(component.userStatusData).toEqual([
      { name: 'Active users', value: 2 },
      { name: 'Inactive users', value: 1 },
    ]);
  });

  it('surfaces authorization failures from the admin users endpoint', () => {
    userManagementService.query.mockReturnValue(
      throwError(() => ({
        status: 403,
      })),
    );

    component.ngOnInit();

    expect(component.errorMessage).toBe('You do not have access to user activity data.');
    expect(component.isLoading).toBe(false);
  });
});

function createUser(overrides: Partial<IUser>): IUser {
  return {
    id: overrides.id ?? 'user-id',
    login: overrides.login ?? 'user',
    activated: overrides.activated ?? false,
    authorities: overrides.authorities ?? ['ROLE_USER'],
    createdDate: overrides.createdDate,
    ...overrides,
  };
}
