import { Component, DestroyRef, Input, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Account } from 'app/core/auth/account.model';
import SharedModule from 'app/shared/shared.module';
import { DashboardService } from './dashboard.service';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Authority } from 'app/config/authority.constants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TemperatureComponent } from 'app/features/temperature/temperature.component';
import { BloodPressureComponent } from 'app/features/blood-pressure/blood-pressure.component';
import { HeartRateComponent } from 'app/features/heart-rate/heart-rate.component';
import { SugarComponent } from 'app/features/sugar/sugar.component';
import { AllergyComponent } from 'app/features/allergies/allergy.component';
import { EmergencyComponent } from 'app/features/emergency/emergency.component';
import { MetricPanelComponent } from './metric-panel/metric-panel.component';
import { StatusComponent } from './status-panel/status.component';

@Component({
    selector: 'hpd-dashboard',
    imports: [CommonModule, SharedModule, RouterModule, MetricPanelComponent, StatusComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @Input() account?: Account;
  readonly phoneNumber = signal<string>('');
  readonly membership = signal<string>('');
  readonly selectedPage = signal<string>('status');

  readonly metrics = [
    { id: '1', name: 'temperature', label: 'Temperature', value: 36, route: 'temperature', extra: '1' },
    { id: '2', name: 'pressure', label: 'Blood pressure', value: 140, route: 'pressure', extra: '2' },
    { id: '3', name: 'heart rate', label: 'Heart rate', value: 36, route: 'heartrate', extra: '3' },
    { id: '4', name: 'sugar', label: 'Sugar', value: 36, route: 'sugar', extra: '4' },
    { id: '5', name: 'emergencies', label: 'Emergencies', value: 1, route: 'emergencies', extra: '1' },
    { id: '6', name: 'allergies', label: 'Allergies', value: 0, route: 'allergies', extra: '2' },
    { id: '7', name: 'services', label: 'Services', value: 10, route: 'services', extra: '3' },
    { id: '8', name: 'diet', label: 'Diet', value: 3, route: 'diet', extra: '4' },
  ];

  readonly topCards = computed(() => this.metrics.slice(0, 4));
  readonly lowCards = computed(() => this.metrics.slice(4));

  isUserRole!: boolean;

  isOpen = false;
  isNavbarCollapsed = false;
  readonly destroyRef = inject(DestroyRef);

  constructor(
    private dashboardService: DashboardService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.selectedPage.set(sessionStorage.getItem('page') ?? 'status');
    if (this.account?.activated) {
      this.isUserRole = this.account.authorities.indexOf(Authority.USER) > -1;
      this.fetchProfileInformation(this.account.email);
    }
  }

  fetchProfileInformation(email: string): void {
    // phoneNumber = data.phoneNumber
    // membership = data.membership
    this.dashboardService
      .fetchInformationByEmail(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: HttpResponse<any>) => {
          this.phoneNumber.set(res.body.phoneNumber);
          this.membership.set(res.body.membership);
        },
      });
  }
  openPage(page: string): void {
    this.selectedPage.set(page);
    sessionStorage.setItem('page', page);
  }

  metricSelected(stat: any): void {
    switch (stat.route) {
      case 'temperature':
        // open temperature modal
        if (!this.isOpen) {
          this.isOpen = true;
          const modalRef: NgbModalRef = this.modalService.open(TemperatureComponent, { size: 'xl', centered: true });
          modalRef.result.finally(() => (this.isOpen = false));
        }
        break;
      case 'pressure':
        // open pressure modal
        if (!this.isOpen) {
          this.isOpen = true;
          const modalRef: NgbModalRef = this.modalService.open(BloodPressureComponent, { size: 'xl', centered: true });
          modalRef.componentInstance.admin = this.account;
          modalRef.result.finally(() => (this.isOpen = false));
        }
        break;
      case 'heartrate':
        // open heart-rate modal
        if (!this.isOpen) {
          this.isOpen = true;
          const modalRef: NgbModalRef = this.modalService.open(HeartRateComponent, { size: 'xl', centered: true });
          modalRef.componentInstance.admin = this.account;
          modalRef.result.finally(() => (this.isOpen = false));
        }
        break;
      case 'sugar':
        // open sugar modal
        if (!this.isOpen) {
          this.isOpen = true;
          const modalRef: NgbModalRef = this.modalService.open(SugarComponent, { size: 'xl', centered: true });
          modalRef.componentInstance.admin = this.account;
          modalRef.result.finally(() => (this.isOpen = false));
        }
        break;
      case 'emergencies':
        // open emergencies modal
        if (!this.isOpen) {
          this.isOpen = true;
          const modalRef: NgbModalRef = this.modalService.open(EmergencyComponent, { size: 'xl', centered: true });
          modalRef.componentInstance.admin = this.account;
          modalRef.result.finally(() => (this.isOpen = false));
        }
        break;
      case 'allergies':
        // open allergies modal
        if (!this.isOpen) {
          this.isOpen = true;
          const modalRef: NgbModalRef = this.modalService.open(AllergyComponent, { size: 'xl', centered: true });
          modalRef.componentInstance.admin = this.account;
          modalRef.result.finally(() => (this.isOpen = false));
        }
        break;
      case 'services':
        // open services modal
        break;
      case 'diet':
        // open diet modal
        break;
    }
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
}
