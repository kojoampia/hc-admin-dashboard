import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { PricingPlanService } from './service/pricing-plan.service';
import { DashboardStateService } from '../dashboard/dashboard-state';
import { PricePlanDialogComponent } from './price-plan-dialog';
import { IPricingPlan } from './pricing-plan.model';

export interface PricePlan {
  id: string | null;
  name: string;
  price: number;
  billingCycle: 'MONTHLY' | 'ANNUALLY';
  features: string;
}

@Component({
  selector: 'hpd-pricing-plan',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './pricing-plan.html',
})
export class PricingPlanComponent implements OnInit {
  private api = inject(PricingPlanService);
  private dialog = inject(MatDialog);
  state = inject(DashboardStateService);

  plans = signal<IPricingPlan[]>([]);

  ngOnInit(): void {
    this.loadPlans();
  }

  openAddEditModal(plan?: IPricingPlan): void {
    if (plan && !this.state.canAccess('PRICE_PLANS', 'UPDATE')) return;
    if (!plan && !this.state.canAccess('PRICE_PLANS', 'CREATE')) return;

    const dialogRef = this.dialog.open(PricePlanDialogComponent, {
      width: '600px',
      data: plan ?? null,
    });

    dialogRef.afterClosed().subscribe((result: IPricingPlan | undefined) => {
      if (result) {
        if (plan && plan.id) {
          this.api.update(result).subscribe(() => this.loadPlans());
        } else {
          const newPlan = { ...result, id: null };
          this.api.create(newPlan as any).subscribe(() => this.loadPlans());
        }
      }
    });
  }

  loadPlans(): void {
    this.api.query().subscribe(res => {
      if (res.body) {
        this.plans.set(res.body);
      }
    });
  }
}
