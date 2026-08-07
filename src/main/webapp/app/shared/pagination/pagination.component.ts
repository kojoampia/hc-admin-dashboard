import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Numbered page links, replacing `<ngb-pagination>`.
 *
 * <p>Deliberately not `MatPaginator`. That renders a "1 – 20 of 100" bar with only next/previous,
 * which is a different control: it would duplicate the `hpd-item-count` sitting beside it in all
 * twelve list templates, and lose the numbered links those screens have always had. Reimplementing
 * the small piece of ng-bootstrap actually in use removes the dependency rather than trading it for
 * another one — and ng-bootstrap is what pins Angular to 19, which is what pins the open XSS
 * advisories open.
 *
 * <p>The inputs mirror ng-bootstrap's names exactly, so the call sites did not have to change.
 */
@Component({
  selector: 'hpd-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @if (totalPages() > 1) {
      <nav role="navigation" aria-label="Pagination">
        <ul class="flex list-none items-center gap-1 p-0">
          @if (boundaryLinks()) {
            <li>
              <button mat-icon-button type="button" aria-label="First page" [disabled]="page() <= 1" (click)="select(1)" class="!h-9 !w-9">
                <mat-icon class="!text-lg">first_page</mat-icon>
              </button>
            </li>
          }
          <li>
            <button
              mat-icon-button
              type="button"
              aria-label="Previous page"
              [disabled]="page() <= 1"
              (click)="select(page() - 1)"
              class="!h-9 !w-9"
            >
              <mat-icon class="!text-lg">chevron_left</mat-icon>
            </button>
          </li>

          @for (p of visiblePages(); track p) {
            <li>
              <button
                mat-button
                type="button"
                [attr.aria-label]="'Page ' + p"
                [attr.aria-current]="p === page() ? 'page' : null"
                (click)="select(p)"
                class="!min-w-9 !h-9 !rounded-lg"
                [class.!bg-hpd-primary]="p === page()"
                [class.!text-white]="p === page()"
              >
                {{ p }}
              </button>
            </li>
          }

          <li>
            <button
              mat-icon-button
              type="button"
              aria-label="Next page"
              [disabled]="page() >= totalPages()"
              (click)="select(page() + 1)"
              class="!h-9 !w-9"
            >
              <mat-icon class="!text-lg">chevron_right</mat-icon>
            </button>
          </li>
          @if (boundaryLinks()) {
            <li>
              <button
                mat-icon-button
                type="button"
                aria-label="Last page"
                [disabled]="page() >= totalPages()"
                (click)="select(totalPages())"
                class="!h-9 !w-9"
              >
                <mat-icon class="!text-lg">last_page</mat-icon>
              </button>
            </li>
          }
        </ul>
      </nav>
    }
  `,
})
export class PaginationComponent {
  readonly collectionSize = input.required<number>();
  readonly page = input.required<number>();
  readonly pageSize = input(20);
  /** Maximum number of numbered links shown at once. */
  readonly maxSize = input(5);
  /**
   * When the window of numbered links is smaller than the total, keep the current page centred
   * within it rather than letting it sit at an edge. ng-bootstrap's `rotate`.
   */
  readonly rotate = input(false);
  readonly boundaryLinks = input(false);

  readonly pageChange = output<number>();

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    // Guard the divide: a pageSize of 0 would otherwise make this Infinity and render forever.
    return size > 0 ? Math.max(1, Math.ceil(this.collectionSize() / size)) : 1;
  });

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const max = Math.max(1, this.maxSize());
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start: number;
    if (this.rotate()) {
      // Centre the window on the current page, then clamp so it never runs past either end.
      start = Math.min(Math.max(1, this.page() - Math.floor(max / 2)), total - max + 1);
    } else {
      // Fixed blocks: pages 1-5, 6-10, and so on.
      start = Math.floor((this.page() - 1) / max) * max + 1;
    }
    return Array.from({ length: Math.min(max, total - start + 1) }, (_, i) => start + i);
  });

  select(page: number): void {
    // Clicking the current page, or a disabled arrow, must not re-issue a request.
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.pageChange.emit(page);
  }
}
