import { Directive, EventEmitter, Input, Output, model } from '@angular/core';

import type { SortState } from './sort.service';

@Directive({
  standalone: true,
  selector: '[hpdSort]',
})
export default class SortDirective<T extends string = string> {
  readonly sortState = model<SortState<T>>({});

  @Input()
  get predicate(): T | undefined {
    return this.sortState().predicate;
  }
  set predicate(predicate: T | undefined) {
    this.updateSortState({ predicate, order: this.sortState().order });
    this.predicateChange.emit(predicate);
  }

  @Input()
  get ascending(): boolean | undefined {
    return this.sortState().order ? this.sortState().order === 'asc' : undefined;
  }
  set ascending(ascending: boolean | undefined) {
    this.updateSortState({ predicate: this.sortState().predicate, order: ascending === undefined ? undefined : ascending ? 'asc' : 'desc' });
    this.ascendingChange.emit(ascending);
  }

  @Output() predicateChange = new EventEmitter<T>();
  @Output() ascendingChange = new EventEmitter<boolean>();
  @Output() sortChange = new EventEmitter<SortState<T> & { ascending: boolean }>();

  sort(field: T): void {
    const ascending = field !== this.predicate ? true : !this.ascending;
    const nextSortState: SortState<T> = { predicate: field, order: ascending ? 'asc' : 'desc' };

    this.updateSortState(nextSortState);
    this.predicateChange.emit(field);
    this.ascendingChange.emit(ascending);
    this.sortChange.emit({ ...nextSortState, ascending });
  }

  private updateSortState(sortState: SortState<T>): void {
    this.sortState.set(sortState);
  }
}
