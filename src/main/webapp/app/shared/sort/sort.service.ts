import { Injectable, signal, type WritableSignal } from '@angular/core';

export type SortOrder = 'asc' | 'desc';

export interface SortState<T extends string = string> {
  predicate?: T;
  order?: SortOrder;
}

export const sortStateSignal = <T extends string = string>(initialState: SortState<T> = {}): WritableSignal<SortState<T>> =>
  signal(initialState);

@Injectable({ providedIn: 'root' })
export class SortService {
  private readonly collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });

  parseSortParam(sortParam: string | null | undefined): SortState {
    if (!sortParam) {
      return {};
    }

    const [predicate, order] = sortParam.split(',');
    if (!predicate) {
      return {};
    }

    return {
      predicate,
      order: order === 'desc' ? 'desc' : 'asc',
    };
  }

  buildSortParam(sortState: SortState): string[] {
    const { predicate, order } = sortState;

    return predicate && order ? [`${predicate},${order}`] : [];
  }

  startSort(sortState: SortState): (a: unknown, b: unknown) => number;
  startSort(property: string, order: number): (a: unknown, b: unknown) => number;
  startSort(sortOrProperty: SortState | string, order = 1): (a: unknown, b: unknown) => number {
    const sortState =
      typeof sortOrProperty === 'string'
        ? { predicate: sortOrProperty, order: order === -1 ? 'desc' : 'asc' }
        : sortOrProperty;

    if (!sortState.predicate || !sortState.order) {
      return () => 0;
    }

    const direction = sortState.order === 'desc' ? -1 : 1;

    const predicate = sortState.predicate;

    return (a: unknown, b: unknown): number =>
      this.collator.compare(this.readValue(a, predicate), this.readValue(b, predicate)) * direction;
  }

  private readValue(entity: unknown, predicate: string): string {
    if (entity && typeof entity === 'object' && predicate in entity) {
      return String((entity as Record<string, unknown>)[predicate] ?? '');
    }

    return '';
  }
}
