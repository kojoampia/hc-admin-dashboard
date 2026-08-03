import '@angular/compiler';
import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let stateStorageService: jest.Mocked<Pick<StateStorageService, 'getAuthenticationToken'>>;
  let applicationConfigService: jest.Mocked<Pick<ApplicationConfigService, 'getEndpointFor'>>;
  let next: jest.Mocked<Pick<HttpHandler, 'handle'>>;

  beforeEach(() => {
    stateStorageService = {
      getAuthenticationToken: jest.fn(),
    };
    applicationConfigService = {
      getEndpointFor: jest.fn((endpoint: string) => endpoint),
    };
    next = {
      handle: jest.fn((req: HttpRequest<any>) => of(new HttpResponse({ status: 200, body: req.url }))),
    };

    interceptor = new AuthInterceptor(
      stateStorageService as unknown as StateStorageService,
      applicationConfigService as unknown as ApplicationConfigService,
    );
  });

  it('adds the bearer token to protected API requests', () => {
    stateStorageService.getAuthenticationToken.mockReturnValue('token-123');

    interceptor.intercept(new HttpRequest('GET', 'api/account'), next as HttpHandler).subscribe();

    expect(next.handle).toHaveBeenCalledTimes(1);
    const forwardedRequest = next.handle.mock.calls[0]![0];
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('does not add the bearer token to the authentication request', () => {
    stateStorageService.getAuthenticationToken.mockReturnValue('token-123');

    interceptor.intercept(new HttpRequest('POST', 'api/authenticate', {}), next as HttpHandler).subscribe();

    expect(next.handle).toHaveBeenCalledTimes(1);
    const forwardedRequest = next.handle.mock.calls[0]![0];
    expect(forwardedRequest.headers.has('Authorization')).toBe(false);
  });
});
