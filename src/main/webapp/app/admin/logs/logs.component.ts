import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SortDirective, SortByDirective } from 'app/shared/sort';
import { GatewayRoutesService } from '../gateway/gateway-routes.service';
import { Log, LoggersResponse, Level } from './log.model';
import { LogsService } from './logs.service';

@Component({
  selector: 'hpd-logs',
  templateUrl: './logs.component.html',
  providers: [GatewayRoutesService],
  imports: [
    SharedModule,
    FormsModule,
    SortDirective,
    SortByDirective,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
})
export default class LogsComponent implements OnInit {
  readonly logLevels: Level[] = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'OFF'];
  loggers?: Log[];
  filteredAndOrderedLoggers?: Log[];
  isLoading = false;
  filter = '';
  orderProp: keyof Log = 'name';
  ascending = true;
  services: string[] = [];
  selectedService: string | undefined = undefined;

  constructor(
    private logsService: LogsService,
    private gatewayRoutesService: GatewayRoutesService,
  ) {}

  ngOnInit(): void {
    this.findAndExtractLoggers();
    this.loadServicesOptions();
  }

  changeLevel(name: string, level: Level): void {
    this.logsService.changeLevel(name, level, this.selectedService).subscribe(() => this.findAndExtractLoggers());
  }

  changeService(service: string): void {
    this.selectedService = service.replace('Service', '').toLowerCase();
    this.findAndExtractLoggers();
  }

  filterAndSort(): void {
    this.filteredAndOrderedLoggers = this.loggers!.filter(
      logger => !this.filter || logger.name.toLowerCase().includes(this.filter.toLowerCase()),
    ).sort((a, b) => {
      if (a[this.orderProp] < b[this.orderProp]) {
        return this.ascending ? -1 : 1;
      } else if (a[this.orderProp] > b[this.orderProp]) {
        return this.ascending ? 1 : -1;
      } else if (this.orderProp === 'level') {
        return a.name < b.name ? -1 : 1;
      }
      return 0;
    });
  }

  private findAndExtractLoggers(): void {
    this.isLoading = true;
    this.logsService
      .findAll(this.selectedService)
      .pipe(
        finalize(() => {
          this.filterAndSort();
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response: LoggersResponse) =>
          (this.loggers = Object.entries(response.loggers).map(([key, logger]) => new Log(key, logger.effectiveLevel))),
        error: () => (this.loggers = []),
      });
  }

  private loadServicesOptions(): void {
    this.gatewayRoutesService
      .findAll()
      .pipe(map(routes => routes.map(route => route.serviceId)))
      .pipe(map(services => services.filter(service => service.endsWith('Service'))))
      .subscribe(services => (this.services = services));
  }
}
