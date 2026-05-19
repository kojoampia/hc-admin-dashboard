import { AfterContentInit, ContentChild, Directive, ElementRef, Host, HostListener, Input, OnDestroy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SortDirective from './sort.directive';

@Directive({
  standalone: true,
  selector: '[hpdSortBy]',
})
export default class SortByDirective<T extends string = string> implements AfterContentInit, OnDestroy {
  @Input() hpdSortBy!: T;

  @ContentChild(MatIcon, { read: ElementRef, static: false })
  iconElement?: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(@Host() private sort: SortDirective<T>) {
    sort.predicateChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateIconDefinition());
    sort.ascendingChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateIconDefinition());
  }

  @HostListener('click')
  onClick(): void {
    if (this.iconElement) {
      this.sort.sort(this.hpdSortBy);
    }
  }

  ngAfterContentInit(): void {
    this.updateIconDefinition();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateIconDefinition(): void {
    if (this.iconElement) {
      let icon = 'unfold_more';
      if (this.sort.predicate === this.hpdSortBy) {
        icon = this.sort.ascending ? 'arrow_upward' : 'arrow_downward';
      }
      this.iconElement.nativeElement.textContent = icon;
    }
  }
}
