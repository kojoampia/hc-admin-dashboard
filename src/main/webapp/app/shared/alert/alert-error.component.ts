import { Component, OnDestroy, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService } from '@ngx-translate/core';

import { Alert, AlertService } from 'app/core/util/alert.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertError } from './alert-error.model';

@Component({
  selector: 'hpd-alert-error',
  templateUrl: './alert-error.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class AlertErrorComponent implements OnDestroy {
  private alertService = inject(AlertService);
  private eventManager = inject(EventManager);

  alerts: Alert[] = [];
  errorListener: Subscription;
  httpErrorListener: Subscription;

  constructor() {
    const eventManager = this.eventManager;
    const translateService = inject(TranslateService);

    this.errorListener = eventManager.subscribe('adminGatewayApp.error', (response: EventWithContent<unknown> | string) => {
      const errorResponse = (response as EventWithContent<AlertError>).content;
      this.addErrorAlert(errorResponse.message, errorResponse.key, errorResponse.params);
    });

    this.httpErrorListener = eventManager.subscribe('adminGatewayApp.httpError', (response: EventWithContent<unknown> | string) => {
      const httpErrorResponse = (response as EventWithContent<HttpErrorResponse>).content;
      switch (httpErrorResponse.status) {
        // connection refused, server not reachable
        case 0:
          this.addErrorAlert('Server not reachable', 'error.server.not.reachable');
          break;

        case 400: {
          const arr = httpErrorResponse.headers.keys();
          let errorHeader: string | null = null;
          let entityKey: string | null = null;
          for (const entry of arr) {
            if (entry.toLowerCase().endsWith('app-error')) {
              errorHeader = httpErrorResponse.headers.get(entry);
            } else if (entry.toLowerCase().endsWith('app-params')) {
              entityKey = httpErrorResponse.headers.get(entry);
            }
          }
          if (errorHeader) {
            const alertData = entityKey ? { entityName: translateService.instant(`global.menu.entities.${entityKey}`) } : undefined;
            this.addErrorAlert(errorHeader, errorHeader, alertData);
          } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.fieldErrors) {
            const fieldErrors = httpErrorResponse.error.fieldErrors;
            for (const fieldError of fieldErrors) {
              if (['Min', 'Max', 'DecimalMin', 'DecimalMax'].includes(fieldError.message)) {
                fieldError.message = 'Size';
              }
              // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
              const convertedField: string = fieldError.field.replace(/\[\d*\]/g, '[]');
              const fieldName: string = translateService.instant(`adminGatewayApp.${fieldError.objectName as string}.${convertedField}`);
              this.addErrorAlert(`Error on field "${fieldName}"`, `error.${fieldError.message as string}`, { fieldName });
            }
          } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.message) {
            this.addErrorAlert(
              httpErrorResponse.error.detail ?? httpErrorResponse.error.message,
              httpErrorResponse.error.message,
              httpErrorResponse.error.params,
            );
          } else {
            this.addErrorAlert(httpErrorResponse.error, httpErrorResponse.error);
          }
          break;
        }

        case 404:
          this.addErrorAlert('Not found', 'error.url.not.found');
          break;

        default:
          if (httpErrorResponse.error !== '' && httpErrorResponse.error.message) {
            this.addErrorAlert(
              httpErrorResponse.error.detail ?? httpErrorResponse.error.message,
              httpErrorResponse.error.message,
              httpErrorResponse.error.params,
            );
          } else {
            this.addErrorAlert(httpErrorResponse.error, httpErrorResponse.error);
          }
      }
    });
  }

  setClasses(alert: Alert): { [key: string]: boolean } {
    const classes = { 'hpd-toast': Boolean(alert.toast) };
    if (alert.position) {
      return { ...classes, [alert.position]: true };
    }
    return classes;
  }

  ngOnDestroy(): void {
    this.eventManager.destroy(this.errorListener);
    this.eventManager.destroy(this.httpErrorListener);
  }

  close(alert: Alert): void {
    alert.close?.(this.alerts);
  }

  iconFor(alert: Alert): string {
    switch (alert.type) {
      case 'warning':
        return 'warning';
      case 'success':
        return 'check_circle';
      default:
        return 'error';
    }
  }

  panelClasses(alert: Alert): string {
    switch (alert.type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'success':
        return 'border-emerald-200 bg-emerald-50 text-emerald-900';
      default:
        return 'border-rose-200 bg-rose-50 text-rose-900';
    }
  }

  private addErrorAlert(message?: string, translationKey?: string, translationParams?: { [key: string]: unknown }): void {
    this.alertService.addAlert({ type: 'danger', message, translationKey, translationParams }, this.alerts);
  }
}
