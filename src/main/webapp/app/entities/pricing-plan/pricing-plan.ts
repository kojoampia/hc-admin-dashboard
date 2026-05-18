import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { PricingPlanService } from './service/pricing-plan.service';
import { DashboardStateService } from '../dashboard/dashboard-state';
import { PricePlanDialogComponent } from './price-plan-dialog';

export interface PricePlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
}

@Component({
  selector: 'hpd-pricing-plan',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './pricing-plan.html',
})
export class PricingPlanComponent {
  private api = inject(PricingPlanService);
  private dialog = inject(MatDialog);
  state = inject(DashboardStateService);

  plans = signal<PricePlan[]>([
    {
      id: '1',
      name: 'PEAR',
      price: 1000,
      billingCycle: 'MONTHLY',
      features: [
        'Basic health tracking',
        '5 Weekly visits',
        'Basic support',
        'Nursing support',
        'Hospital transportation',
        'Grooming assistance',
        'Cooking assistance',
        'Cleaning assistance',
        'Washing assistance',
        'Grocery shopping assistance',
      ],
    },
    {
      id: '2',
      name: 'MELON',
      price: 3000,
      billingCycle: 'MONTHLY',
      features: [
        'Standard health tracking',
        '7 Weekly visits',
        'Standard support',
        'Nursing support',
        'Hospital transportation',
        'Grooming assistance',
        'Cooking assistance',
        'Cleaning assistance',
        'Washing assistance',
        'Grocery shopping assistance',
      ],
    },
    {
      id: '3',
      name: 'PAWPAW',
      price: 5000,
      billingCycle: 'MONTHLY',
      features: [
        'VIP health tracking',
        '24/7',
        'VIP support',
        'Nursing support',
        'Hospital transportation',
        'Grooming assistance',
        'Cooking assistance',
        'Cleaning assistance',
        'Washing assistance',
        'Grocery shopping assistance',
      ],
    },
  ]);

  openAddEditModal(plan?: PricePlan): void {
    if (plan && !this.state.canAccess('PRICE_PLANS', 'UPDATE')) return;
    if (!plan && !this.state.canAccess('PRICE_PLANS', 'CREATE')) return;

    const dialogRef = this.dialog.open(PricePlanDialogComponent, {
      width: '600px',
      data: plan ?? null,
    });

    dialogRef.afterClosed().subscribe((result: PricePlan | undefined) => {
      if (result) {
        if (plan) {
          this.api.put(`/plans/${plan.id}`, result).subscribe(() => this.loadPlans());
        } else {
          this.api.post('/plans', result).subscribe(() => this.loadPlans());
        }
      }
    });
  }

  loadPlans(): void {
    this.api.get<PricePlan[]>('/plans').subscribe((data: PricePlan[]) => {
      if (data && data.length > 0) {
        this.plans.set(data);
      }
    });
  }
}
