import { TestBed } from '@angular/core/testing';
import '@angular/compiler';
import { ElementRef, EventEmitter } from '@angular/core';

import SortByDirective from './sort-by.directive';
import SortDirective from './sort.directive';

describe('Directive: SortByDirective', () => {
  let sortDirective: {
    predicate?: string;
    ascending?: boolean;
    predicateChange: EventEmitter<string>;
    ascendingChange: EventEmitter<boolean>;
    sort: jest.Mock;
  };
  let sortByDirective: SortByDirective<string>;
  let iconElement: ElementRef<HTMLElement>;
  let transition: jest.Mock;

  beforeEach(() => {
    sortDirective = {
      predicate: undefined,
      ascending: undefined,
      predicateChange: new EventEmitter<string>(),
      ascendingChange: new EventEmitter<boolean>(),
      sort: jest.fn((field: string) => {
        const ascending = field !== sortDirective.predicate ? true : !sortDirective.ascending;
        sortDirective.predicate = field;
        sortDirective.ascending = ascending;
        sortDirective.predicateChange.emit(field);
        sortDirective.ascendingChange.emit(ascending);
        transition({ predicate: field, order: ascending ? 'asc' : 'desc', ascending });
      }),
    };
    // Constructed through the injector now that the class uses inject(). The doubles and every
    // assertion below are unchanged.
    TestBed.configureTestingModule({
      providers: [{ provide: SortDirective, useValue: sortDirective }],
    });
    sortByDirective = TestBed.runInInjectionContext(() => new SortByDirective());
    sortByDirective.hpdSortBy = 'name';
    iconElement = new ElementRef(document.createElement('mat-icon'));
    sortByDirective.iconElement = iconElement;
    transition = jest.fn();
  });

  it('should initialize predicate, order, icon when initial component predicate differs from column predicate', () => {
    // GIVEN
    sortDirective.predicate = 'id';

    // WHEN
    sortByDirective.ngAfterContentInit();

    // THEN
    expect(sortByDirective.hpdSortBy).toEqual('name');
    expect(sortDirective.predicate).toEqual('id');
    expect(iconElement.nativeElement.textContent.trim()).toEqual('unfold_more');
    expect(transition).toHaveBeenCalledTimes(0);
  });

  it('should initialize predicate, order, icon when initial component predicate is same as column predicate', () => {
    // GIVEN
    sortDirective.predicate = 'name';
    sortDirective.ascending = true;

    // WHEN
    sortByDirective.ngAfterContentInit();

    // THEN
    expect(sortByDirective.hpdSortBy).toEqual('name');
    expect(sortDirective.predicate).toEqual('name');
    expect(sortDirective.ascending).toEqual(true);
    expect(iconElement.nativeElement.textContent.trim()).toEqual('arrow_upward');
    expect(transition).toHaveBeenCalledTimes(0);
  });

  it('should update component predicate, order, icon when user clicks on column header', () => {
    // GIVEN
    sortDirective.predicate = 'name';
    sortDirective.ascending = true;
    sortByDirective.ngAfterContentInit();

    // WHEN
    sortByDirective.onClick();

    // THEN
    expect(sortDirective.predicate).toEqual('name');
    expect(sortDirective.ascending).toEqual(false);
    expect(iconElement.nativeElement.textContent.trim()).toEqual('arrow_downward');
    expect(transition).toHaveBeenCalledTimes(1);
    expect(transition).toHaveBeenCalledWith({ predicate: 'name', order: 'desc', ascending: false });
  });

  it('should update component predicate, order, icon when user double clicks on column header', () => {
    // GIVEN
    sortDirective.predicate = 'name';
    sortDirective.ascending = true;
    sortByDirective.ngAfterContentInit();

    // WHEN
    sortByDirective.onClick();
    sortByDirective.onClick();

    // THEN
    expect(sortDirective.predicate).toEqual('name');
    expect(sortDirective.ascending).toEqual(true);
    expect(iconElement.nativeElement.textContent.trim()).toEqual('arrow_upward');
    expect(transition).toHaveBeenCalledTimes(2);
    expect(transition).toHaveBeenNthCalledWith(1, { predicate: 'name', order: 'desc', ascending: false });
    expect(transition).toHaveBeenNthCalledWith(2, { predicate: 'name', order: 'asc', ascending: true });
  });

  it('should not run sorting on click if sorting icon is hidden', () => {
    // GIVEN
    sortDirective.predicate = 'id';
    sortDirective.ascending = false;
    sortByDirective.iconElement = undefined;

    // WHEN
    sortByDirective.onClick();

    // THEN
    expect(sortDirective.predicate).toEqual('id');
    expect(sortDirective.ascending).toEqual(false);
    expect(transition).not.toHaveBeenCalled();
  });
});
