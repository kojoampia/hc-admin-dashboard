import '@angular/compiler';

import { signal } from '@angular/core';

import type { ActivityEvent, DashboardStateService } from 'app/entities/dashboard/dashboard-state';

(globalThis as { REALTIME_ENABLED?: boolean }).REALTIME_ENABLED = false;

import RealTimeDataComponent from './real-time-data';

describe('RealTimeDataComponent', () => {
  let dashboardState: Pick<DashboardStateService, 'operationLogs' | 'auditTrailConnected' | 'connectAuditTrail' | 'disconnectAuditTrail'>;
  let connected: ReturnType<typeof signal<boolean>>;
  let component: RealTimeDataComponent;

  beforeEach(() => {
    connected = signal(false);
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
      // The component reads this rather than assuming a connection happened — see the field comment
      // on RealTimeDataComponent.isConnected.
      auditTrailConnected: connected,
      connectAuditTrail: jest.fn(() => connected.set(true)),
      disconnectAuditTrail: jest.fn(() => connected.set(false)),
    };

    component = new RealTimeDataComponent(dashboardState as DashboardStateService);
  });

  it('connects to the live feed and summarizes the latest activity', () => {
    component.ngOnInit();

    expect(dashboardState.connectAuditTrail).toHaveBeenCalled();
    expect(component.isConnected()).toBe(true);
    expect(component.latestEvents()).toHaveLength(2);
    expect(component.securityEventCount()).toBe(1);
    expect(component.distinctEventTypes()).toBe(2);
    expect(component.eventTypeSummary()[0]).toEqual({ type: 'Security', count: 1 });

    component.ngOnDestroy();
    expect(dashboardState.disconnectAuditTrail).toHaveBeenCalled();
    expect(component.isConnected()).toBe(false);
  });

  it('reports Offline until the stream is actually reading', () => {
    // The bug this replaces: isConnected was a plain field set to true on the line after
    // connectAuditTrail(), so the tile said "Live" whether or not anything connected.
    component.ngOnInit();
    connected.set(false);

    expect(component.isConnected()).toBe(false);
  });
});
