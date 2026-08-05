import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { ProfileDialogComponent, ProfileData, ProfileType } from 'app/entities/profile/profile-dialog';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { PersonService } from 'app/entities/person/service/person.service';
import { IProfile } from 'app/entities/profile/profile.model';

/**
 * The directory of profiles, on the sidebar's `/profiles` route.
 *
 * <p>This used to render seven hardcoded people — "Alice Johnson", "MediCorp Systems", "John Doe" —
 * while injecting {@link ProfileService} and never calling it. It now reads the api.
 *
 * <h2>What the api does and does not provide</h2>
 *
 * <p>{@code IProfile} has no name: it holds a {@code personId}. Names are resolved with a second
 * call to {@link PersonService} and a client-side join. That is one extra request for the page, not
 * one per row, and a profile whose person cannot be resolved falls back to showing the id rather
 * than a blank or an invented name.
 *
 * <p>{@code status} is a boolean on the api, so it maps to ACTIVE or INACTIVE. The old UI also had
 * a VERIFIED state; nothing in the model backs it, so it is gone rather than faked.
 */
@Component({
  selector: 'hpd-profile',
  standalone: true,
  imports: [NgClass, MatIconModule, MatTableModule, MatButtonModule, MatDialogModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss',
})
export class ProfileComponent {
  readonly profileTypes: ProfileType[] = ['PATIENT', 'PROFESSIONAL', 'VENDOR', 'USER', 'ADMIN'];

  readonly profiles = signal<ProfileData[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  readonly selectedType = signal<ProfileType>('USER');

  readonly filteredProfiles = computed(() => {
    const type = this.selectedType();
    return this.profiles().filter(p => p.roles.includes(type));
  });

  displayedColumns = ['name', 'type', 'status', 'actions'];

  readonly state = inject(DashboardStateService);

  private readonly profileService = inject(ProfileService);
  private readonly personService = inject(PersonService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!this.state.canAccess('PROFILES', 'UPDATE')) {
      this.displayedColumns = ['name', 'type', 'status'];
    }
    this.load();
  }

  /**
   * Editing a profile is an admin action on the directory, not a question about grantable
   * authorities — which is what this asked before ProfileType and UserRole were separated.
   */
  canEditProfile(_profile: ProfileData): boolean {
    return this.state.canAccess('PROFILES', 'UPDATE');
  }

  openAddModal(): void {
    if (!this.state.canAccess('PROFILES', 'CREATE')) {
      return;
    }
    const dialogRef = this.dialog.open(ProfileDialogComponent, { width: '600px', data: null });
    dialogRef.afterClosed().subscribe((result: ProfileData | undefined) => {
      // Dismissing the dialog (ESC or backdrop) emits undefined — without this guard that was
      // pushed into the list and then dereferenced.
      if (!result) {
        return;
      }
      if (result.roles.length > 0) {
        this.selectedType.set(result.roles[0]!);
      }
      // Reload rather than splice the result in: the api assigns the id and normalises the record,
      // so the dialog's view of it is not what was actually stored.
      this.load();
    });
  }

  openEditModal(profile: ProfileData): void {
    if (!this.state.canAccess('PROFILES', 'UPDATE') || !this.canEditProfile(profile)) {
      return;
    }
    const dialogRef = this.dialog.open(ProfileDialogComponent, { width: '600px', data: profile });
    dialogRef.afterClosed().subscribe((result: ProfileData | undefined) => {
      if (!result) {
        return;
      }
      if (result.roles.length > 0 && !result.roles.includes(this.selectedType())) {
        this.selectedType.set(result.roles[0]!);
      }
      this.load();
    });
  }

  private load(): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);

    this.profileService
      .query()
      .pipe(
        switchMap(response => {
          const found = response.body ?? [];
          if (found.length === 0) {
            return of([] as ProfileData[]);
          }
          // One request for the people, not one per profile.
          return this.personService.query().pipe(
            map(people => {
              const namesById = new Map(
                (people.body ?? []).map(person => [person.id, [person.firstName, person.lastName].filter(Boolean).join(' ').trim()]),
              );
              return found.map(profile => this.toRow(profile, namesById));
            }),
            // The names are decoration; losing them should not empty the table.
            catchError(() => of(found.map(profile => this.toRow(profile, new Map())))),
          );
        }),
        catchError(() => {
          this.loadFailed.set(true);
          return of([] as ProfileData[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(rows => {
        this.profiles.set(rows);
        this.isLoading.set(false);
      });
  }

  private toRow(profile: IProfile, namesById: Map<string, string>): ProfileData {
    const name = (profile.personId ? namesById.get(profile.personId) : '') ?? '';
    return {
      // Falling back to the id rather than a blank: an unresolvable person is a data problem worth
      // seeing, and a nameless row is indistinguishable from a rendering bug.
      // `||` not `??` on purpose: an unresolved person yields an EMPTY STRING, not null, and
      // ?? would happily render that blank row.
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      name: name || profile.personId || profile.id,
      roles: this.parseRoles(profile.roles),
      status: profile.status ? 'ACTIVE' : 'INACTIVE',
    };
  }

  /** `roles` is a free-text field on the api — comma or space separated in practice. */
  private parseRoles(roles: string | null | undefined): ProfileType[] {
    if (!roles) {
      return [];
    }
    const known = new Set<string>(['USER', 'ADMIN', 'PATIENT', 'PROFESSIONAL', 'VENDOR', 'EDITOR']);
    return roles
      .split(/[,\s]+/)
      .map(role => role.trim().toUpperCase())
      .filter(role => known.has(role)) as ProfileType[];
  }
}
