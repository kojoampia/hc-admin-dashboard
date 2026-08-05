import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import SharedModule from 'app/shared/shared.module';
import { DashboardLayoutPreset, DashboardLayoutService, DashboardWidgetId } from '../dashboard-layout.service';

@Component({
  selector: 'hpd-customizable-layout',
  templateUrl: './customizable-layout.html',
  styleUrl: './customizable-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SharedModule, MatButtonModule, MatIconModule],
})
export default class CustomizableLayoutComponent {
  private dashboardLayoutService = inject(DashboardLayoutService);

  readonly layout = this.dashboardLayoutService;
  readonly presets: Exclude<DashboardLayoutPreset, 'custom'>[] = ['balanced', 'operations', 'security'];

  setVisibility(widgetId: DashboardWidgetId, visible: boolean): void {
    this.dashboardLayoutService.setWidgetVisibility(widgetId, visible);
  }

  moveWidget(widgetId: DashboardWidgetId, direction: -1 | 1): void {
    this.dashboardLayoutService.moveWidget(widgetId, direction);
  }

  applyPreset(preset: Exclude<DashboardLayoutPreset, 'custom'>): void {
    this.dashboardLayoutService.applyPreset(preset);
  }

  reset(): void {
    this.dashboardLayoutService.reset();
  }

  isPresetActive(preset: Exclude<DashboardLayoutPreset, 'custom'>): boolean {
    return this.dashboardLayoutService.activePreset() === preset;
  }
}
