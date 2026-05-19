import '@angular/compiler';

import { LocalStorageService } from 'ngx-webstorage';

import { DashboardLayoutService } from './dashboard-layout.service';

describe('DashboardLayoutService', () => {
  let service: DashboardLayoutService;
  let localStorageService: jest.Mocked<Pick<LocalStorageService, 'retrieve' | 'store'>>;

  beforeEach(() => {
    localStorageService = {
      retrieve: jest.fn((_key: string) => null),
      store: jest.fn(),
    };

    service = new DashboardLayoutService(localStorageService as unknown as LocalStorageService);
  });

  it('applies presets and persists visibility and ordering updates', () => {
    service.applyPreset('security');

    expect(service.activePreset()).toBe('security');
    expect(service.visibleWidgetIds()).not.toContain('dataExport');
    expect(service.visibleWidgetIds()).toContain('customizableLayout');

    service.setWidgetVisibility('dataExport', true);
    service.setWidgetVisibility('customizableLayout', false);
    service.moveWidget('realtimeData', -1);

    expect(service.activePreset()).toBe('custom');
    expect(service.visibleWidgetIds()).toContain('dataExport');
    expect(service.widgets().find(widget => widget.id === 'customizableLayout')?.visible).toBe(false);
    expect(localStorageService.store).toHaveBeenCalled();
  });

  it('restores the balanced preset after custom visibility changes', () => {
    service.setWidgetVisibility('alerts', false);
    expect(service.visibleWidgetIds()).not.toContain('alerts');

    service.reset();

    expect(service.activePreset()).toBe('balanced');
    expect(service.visibleWidgetIds()).toContain('customizableLayout');
    expect(service.visibleWidgetIds()).toContain('alerts');
  });
});
