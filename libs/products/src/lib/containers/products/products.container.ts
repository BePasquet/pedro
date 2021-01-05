import { Directive, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { select, Store } from '@ngrx/store';
import {
  getMoreProducts,
  getProducts,
  ProductsPartialState,
} from '@pedro/core';
import { Category, Pagination } from '@pedro/data';
import { observableReducer } from '@pedro/utilities';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  mapTo,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { PRODUCTS_CATEGORIES, PRODUCTS_SORT_OPTIONS } from '../../core/const';
import { ProductsComponentState } from '../../core/interfaces/products-component-state.interface';
import {
  controlsToProductFilter,
  CONTROLS_INITIAL_STATE,
  PAGINATION_INITIAL_STATE,
  PRODUCTS_COMPONENT_INITIAL_STATE,
  selectProductComponentState,
} from './products.helper';

@Directive()
export class Products implements OnDestroy {
  readonly state$: Observable<ProductsComponentState>;

  readonly setState = new Subject<Partial<ProductsComponentState>>();

  readonly query$ = new Subject<string>();

  readonly category$ = new Subject<Category>();

  readonly orderBy$ = new Subject<Sort>();

  readonly pagination$ = new Subject<Pagination>();

  readonly categories = PRODUCTS_CATEGORIES;

  readonly sortOptions = PRODUCTS_SORT_OPTIONS;

  readonly paginationLimit = PAGINATION_INITIAL_STATE.limit;

  protected readonly subscriptions = new Subscription();

  constructor(private readonly store: Store<ProductsPartialState>) {
    const categorySlice$ = this.category$.pipe(
      map((category) => ({ category }))
    );

    const orderBySlice$ = this.orderBy$.pipe(map((orderBy) => ({ orderBy })));

    const nameSlice$ = this.query$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      map((name) => ({ name }))
    );

    const filterChanges$ = observableReducer(
      CONTROLS_INITIAL_STATE,
      categorySlice$,
      orderBySlice$,
      nameSlice$
    ).pipe(startWith(CONTROLS_INITIAL_STATE), map(controlsToProductFilter));

    const resetPage$ = filterChanges$.pipe(mapTo({ page: 1 }));

    const changePage$ = this.pagination$.pipe(
      map((pagination) => ({
        page: pagination.offset / PAGINATION_INITIAL_STATE.limit + 1,
      }))
    );

    const requestProducts$ = filterChanges$.pipe(
      tap((filter) => this.store.dispatch(getProducts({ payload: filter })))
    );

    const requestMoreProducts$ = this.pagination$.pipe(
      withLatestFrom(filterChanges$),
      tap(([pagination, filter]) =>
        this.store.dispatch(
          getMoreProducts({ payload: { ...filter, ...pagination } })
        )
      )
    );

    const effects$ = merge(requestProducts$, requestMoreProducts$);

    const storeSlice$ = this.store.pipe(select(selectProductComponentState));

    this.state$ = observableReducer(
      PRODUCTS_COMPONENT_INITIAL_STATE,
      storeSlice$,
      resetPage$,
      changePage$,
      this.setState
    );

    this.subscriptions.add(effects$.subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
