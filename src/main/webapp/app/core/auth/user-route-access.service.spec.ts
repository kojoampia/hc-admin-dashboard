import '@angular/compiler';

import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, Observable, of } from 'rxjs';

import { Authority } from 'app/config/authority.constants';
import { Account } from './account.model';
import { AccountService } from './account.service';
import { StateStorageService } from './state-storage.service';
import { UserRouteAccessService } from './user-route-access.service';

describe('UserRouteAccessService', () => {
  let router: Router;
  let stateStorageService: StateStorageService;
  let accountService: jest.Mocked<Pick<AccountService, 'identity' | 'hasAnyAuthority'>>;

  beforeEach(async () => {
    accountService = {
      identity: jest.fn(),
      hasAnyAuthority: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: BlankComponent },
          { path: 'accessdenied', component: BlankComponent },
        ]),
      ],
      providers: [StateStorageService, { provide: AccountService, useValue: accountService }],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    stateStorageService = TestBed.inject(StateStorageService);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  it('allows administrators to access the dashboard route', async () => {
    accountService.identity.mockReturnValue(of(createAccount([Authority.ADMIN])));
    accountService.hasAnyAuthority.mockReturnValue(true);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(
        () =>
          UserRouteAccessService(
            { data: { authorities: [Authority.ADMIN] } } as any,
            {
              url: '/admin/dashboard',
            } as RouterStateSnapshot,
          ) as Observable<boolean>,
      ),
    );

    expect(result).toBe(true);
    expect(accountService.hasAnyAuthority).toHaveBeenCalledWith([Authority.ADMIN]);
  });

  it('blocks non-admin users from the dashboard route', async () => {
    accountService.identity.mockReturnValue(of(createAccount([Authority.USER])));
    accountService.hasAnyAuthority.mockReturnValue(false);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(
        () =>
          UserRouteAccessService(
            { data: { authorities: [Authority.ADMIN] } } as any,
            {
              url: '/admin/dashboard',
            } as RouterStateSnapshot,
          ) as Observable<boolean>,
      ),
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['accessdenied']);
  });

  it('redirects unauthenticated users to login and stores the dashboard url', async () => {
    stateStorageService.clearUrl();
    accountService.identity.mockReturnValue(of(null));

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(
        () =>
          UserRouteAccessService(
            { data: { authorities: [Authority.ADMIN] } } as any,
            {
              url: '/admin/dashboard',
            } as RouterStateSnapshot,
          ) as Observable<boolean>,
      ),
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(stateStorageService.getUrl()).toBe('/admin/dashboard');
  });
});

function createAccount(authorities: string[]): Account {
  return new Account(true, authorities, 'admin@healthconnect.com', 'Admin', 'en', 'User', 'admin', null);
}

@Component({
  template: '',
})
class BlankComponent {}
