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

  it('applies presets, preserves the locked layout widget, and persists updates', () => {
    service.applyPreset('security');

    expect(service.activePreset()).toBe('security');
    expect(service.visibleWidgetIds()).not.toContain('dataExport');
    expect(service.visibleWidgetIds()).toContain('customizableLayout');

    service.setWidgetVisibility('dataExport', true);
    service.moveWidget('realtimeData', -1);

    expect(service.activePreset()).toBe('custom');
    expect(service.visibleWidgetIds()).toContain('dataExport');
    expect(service.widgets().find(widget => widget.id === 'customizableLayout')?.visible).toBe(true);
    expect(localStorageService.store).toHaveBeenCalled();
  });

  it('ignores attempts to hide the locked customizable layout widget', () => {
    service.setWidgetVisibility('customizableLayout', false);

    expect(service.visibleWidgetIds()).toContain('customizableLayout');
  });
});
