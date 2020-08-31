import { ChangeDetectorRef, Directive } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { createSelector, select, Store } from '@ngrx/store';
import {
  getMoreProducts,
  getProducts,
  Option,
  ProductsPartialState,
  selectProducts,
  selectProductsError,
  selectProductsLoaded,
  selectProductsLoading,
  selectProductsTotal,
} from '@pedro/core';
import { Category, Pagination } from '@pedro/data';
import { observableReducer, stateChanges } from '@pedro/utilities';
import { merge, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
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
} from './products.helper';

const selectProductComponentState = createSelector(
  selectProducts,
  selectProductsLoading,
  selectProductsLoaded,
  selectProductsTotal,
  selectProductsError,
  (products, loading, loaded, total, error) => ({
    products,
    loading,
    loaded,
    total,
    error,
  })
);

@Directive()
export class Products {
  state: ProductsComponentState;

  readonly setState: Subject<Partial<ProductsComponentState>> = new Subject<
    Partial<ProductsComponentState>
  >();

  readonly query$: Subject<string> = new Subject<string>();

  readonly category$: Subject<Category> = new Subject<Category>();

  readonly orderBy$: Subject<Sort> = new Subject<Sort>();

  readonly pagination$: Subject<Pagination> = new Subject<Pagination>();

  readonly categories: Option<Category | string>[] = PRODUCTS_CATEGORIES;

  readonly sortOptions: Option<Sort>[] = PRODUCTS_SORT_OPTIONS;

  readonly paginationLimit: number = PAGINATION_INITIAL_STATE.limit;

  protected readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store<ProductsPartialState>,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    const storeSlice$ = this.store.pipe(select(selectProductComponentState));

    const state$ = stateChanges(
      PRODUCTS_COMPONENT_INITIAL_STATE,
      storeSlice$,
      this.setState
    ).pipe(
      tap((state) => {
        this.state = state;
        this.changeDetectorRef.detectChanges();
      })
    );

    this.subscriptions.add(state$.subscribe());

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

    const requestMoreProducts$ = this.pagination$.pipe(
      withLatestFrom(filterChanges$),
      tap(([pagination, filter]) => {
        this.setState.next({
          page: pagination.offset / PAGINATION_INITIAL_STATE.limit + 1,
        });

        this.store.dispatch(
          getMoreProducts({ payload: { ...filter, ...pagination } })
        );
      })
    );

    const requestProducts$ = filterChanges$.pipe(
      tap((filter) => {
        this.setState.next({ page: 1 });
        this.store.dispatch(getProducts({ payload: filter }));
      })
    );

    const effects$ = merge(requestProducts$, requestMoreProducts$);

    this.subscriptions.add(effects$.subscribe());
  }
}
