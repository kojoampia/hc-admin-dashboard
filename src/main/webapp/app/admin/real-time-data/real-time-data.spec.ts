import '@angular/compiler';

import { signal } from '@angular/core';

import type { ActivityEvent, DashboardStateService } from 'app/entities/dashboard/dashboard-state';

(globalThis as { WEBSOCKET_ENABLED?: boolean }).WEBSOCKET_ENABLED = false;

import RealTimeDataComponent from './real-time-data';

describe('RealTimeDataComponent', () => {
  let dashboardState: Pick<DashboardStateService, 'operationLogs' | 'connectAuditTrail' | 'disconnectAuditTrail'>;
  let component: RealTimeDataComponent;

  beforeEach(() => {
    dashboardState = {
      operationLogs: signal<ActivityEvent[]>([
        {
          id: 'evt-1',
          type: 'Security',
          message: 'Failed logins detected.',
          timestamp: 'just now',
          icon: 'security',
          colorClass: 'bg-rose-100 text-rose-600',
        },
        {
          id: 'evt-2',
          type: 'Audit Log',
          message: 'Configuration updated.',
          timestamp: '2 minutes ago',
          icon: 'receipt_long',
          colorClass: 'bg-indigo-100 text-indigo-600',
        },
      ]),
      connectAuditTrail: jest.fn(),
      disconnectAuditTrail: jest.fn(),
    };

    component = new RealTimeDataComponent(dashboardState as DashboardStateService);
  });

  it('connects to the live feed and summarizes the latest activity', () => {
    component.ngOnInit();

    expect(dashboardState.connectAuditTrail).toHaveBeenCalled();
    expect(component.isConnected).toBe(true);
    expect(component.latestEvents()).toHaveLength(2);
    expect(component.securityEventCount()).toBe(1);
    expect(component.distinctEventTypes()).toBe(2);
    expect(component.eventTypeSummary()[0]).toEqual({ type: 'Security', count: 1 });

    component.ngOnDestroy();
    expect(dashboardState.disconnectAuditTrail).toHaveBeenCalled();
  });
});
