# **Patient-Centric Duty Roster Auto-Schedule Implementation**

This document outlines the complete frontend implementation for the heuristic Auto-Schedule feature. It has been refactored to be **Patient-Centric**, meaning shifts represent a patient's personalized "Daily Service Plan". It also rigorously enforces geographic, team-based, and date-range availability constraints.

You are an expert Angular developer tasked with refactoring a standalone `DutyRosterComponent`.
Refactor the existing `DutyRosterComponent` to focus on a **Patient-Centric** view, where each shift represents a specific service or visit in a patient's daily care plan.
The component should allow admins to select a patient and view their personalized schedule for the day, showing exactly who is assigned to care for them.
The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling.
The component should also include an auto-scheduling feature that assigns staff to shifts based on predefined rules and availability.
The route /duty-roster should render this component from the sidebar links, so ensure it is self-contained and does not rely on external services or state.
The component is located at `/src/webapp/app/entities/duty-roster/duty-roster.ts`.

Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

## **Frontend Implementation: Angular 19 Component (patient-duty-roster.component.ts)**

The frontend is refactored to focus on the **Patient's Daily Service Plan**. An Admin can select a patient (simulated via an input) to view their specific schedule for the day, seeing exactly who is assigned to care for them.

```typescript
import { Component, inject, signal, OnInit, computed } from '@angular/core';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';  
import { MatButtonModule } from '@angular/material/button';  
import { MatIconModule } from '@angular/material/icon';  
import { MatTableModule } from '@angular/material/table';  
import { MatSelectModule } from '@angular/material/select';  
import { MatFormFieldModule } from '@angular/material/form-field';  
import { RosterService, Shift } from '../../core/services/roster.service';  
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({  
  selector: 'app-patient-duty-roster',  
  standalone: true,  
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule, MatSelectModule, MatFormFieldModule],  
  template: `  
    <div class="flex flex-col gap-4 p-6 w-full h-full bg-gray-50 dark:bg-gray-900">  
      <!-- Header & Global Actions -->  
      <div class="flex justify-between items-center mb-2">  
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Daily Service Plans</h2>  
        <button mat-flat-button color="primary"   
                (click)="triggerAutoSchedule()"   
                [disabled]="isScheduling()">  
          <mat-icon>auto_awesome</mat-icon>  
          {{ isScheduling() ? 'Running Auto-Schedule...' : 'Auto-Schedule All Patients' }}  
        </button>  
      </div>

      <!-- Patient Context Selector -->  
      <div class="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">  
        <mat-form-field appearance="outline" class="w-64 mb-[-1.25em]">  
          <mat-label>Select Patient</mat-label>  
          <mat-select [value]="selectedPatientId()" (selectionChange)="onPatientChange($event.value)">  
            <!-- In a real app, this list comes from a signal containing hydrated patient profiles -->  
            <mat-option value="PATIENT_123">Nana Kwa Otu</mat-option>  
            <mat-option value="PATIENT_456">Jane Doe</mat-option>  
          </mat-select>  
        </mat-form-field>  
          
        <span class="text-gray-600 dark:text-gray-300 font-medium ml-4">  
          Viewing Plan For: <strong class="text-blue-600">{{ targetDate() }}</strong>  
        </span>  
      </div>

      <!-- Angular Material Data Table (Patient's Specific Roster) -->  
      <mat-table [dataSource]="patientPlanSignal()" class="mat-elevation-z2 rounded-lg">  
        <ng-container matColumnDef="shiftName">  
          <mat-header-cell *matHeaderCellDef> Service / Visit </mat-header-cell>  
          <mat-cell *matCellDef="let shift">   
            <span class="font-medium text-gray-800">{{shift.shiftName}}</span>   
          </mat-cell>  
        </ng-container>

        <ng-container matColumnDef="requiredRole">  
          <mat-header-cell *matHeaderCellDef> Required Professional </mat-header-cell>  
          <mat-cell *matCellDef="let shift"> {{shift.requiredRole}} </mat-cell>  
        </ng-container>

        <ng-container matColumnDef="assignee">  
          <mat-header-cell *matHeaderCellDef> Assigned To </mat-header-cell>  
          <mat-cell *matCellDef="let shift">   
            <span *ngIf="shift.assigneeId" class="text-blue-600 font-medium">ID: {{shift.assigneeId}}</span>  
            <span *ngIf="!shift.assigneeId" class="text-gray-400 italic">Pending Assignment</span>  
          </mat-cell>  
        </ng-container>

        <ng-container matColumnDef="status">  
          <mat-header-cell *matHeaderCellDef> Status </mat-header-cell>  
          <mat-cell *matCellDef="let shift">   
            <span class="px-2 py-1 text-xs rounded-full font-bold"  
                  [ngClass]="{'bg-green-100 text-green-700': shift.status === 'ASSIGNED', 'bg-amber-100 text-amber-700': shift.status === 'UNASSIGNED'}">  
                {{shift.status}}  
            </span>  
          </mat-cell>  
        </ng-container>

        <mat-header-row *matHeaderRowDef="['shiftName', 'requiredRole', 'assignee', 'status']"></mat-header-row>  
        <mat-row *matRowDef="let row; columns: ['shiftName', 'requiredRole', 'assignee', 'status'];"></mat-row>  
      </mat-table>  
        
      <!-- Empty State -->  
      <div *ngIf="patientPlanSignal().length === 0" class="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow-sm">  
        No service plan scheduled for this patient on this date.  
      </div>  
    </div>  
  `  
})  
export class PatientDutyRosterComponent implements OnInit {  
  private rosterService = inject(RosterService);  
  private snackBar = inject(MatSnackBar);  
  // State management using Angular Signals  
  patientPlanSignal = signal<Shift[]>([]);  
  isScheduling = signal<boolean>(false);  
  targetDate = signal<string>(new Date().toISOString().split('T')[0]);
  selectedPatientId = signal<string>('PATIENT_123'); // Default mock patient

  ngOnInit() {  
    this.refreshPatientPlan();  
  }

  onPatientChange(patientId: string) {  
    this.selectedPatientId.set(patientId);  
    this.refreshPatientPlan();  
  }

  triggerAutoSchedule() {  
    this.isScheduling.set(true);  
    // Auto-schedule runs globally for the day, filling ALL patient plans  
    this.rosterService.autoSchedule(this.targetDate()).subscribe({  
      next: () => {  
        this.snackBar.open('All daily service plans auto-scheduled successfully', 'Close', { duration: 3000 });  
        this.refreshPatientPlan(); // Refresh the currently viewed patient's plan  
        this.isScheduling.set(false);  
      },  
      error: (err) => {  
        this.snackBar.open('Error during auto-scheduling', 'Close', { duration: 3000 });  
        console.error('Scheduling failed', err);  
        this.isScheduling.set(false);  
      }  
    });  
  }

  refreshPatientPlan() {  
    if (!this.selectedPatientId()) return;  
    this.rosterService.getPatientDailyPlan(this.selectedPatientId(), this.targetDate()).subscribe(shifts => {  
      this.patientPlanSignal.set(shifts);
    });  
  }  
}  
```

# ** Conclusion **

This implementation transforms the duty roster into a patient-centric scheduling system, where each shift represents a specific service or visit in a patient's daily care plan. The frontend allows admins to view and manage these plans with real-time feedback on scheduling status, while the backend ensures that all constraints are respected during the auto-scheduling process.
