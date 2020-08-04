import { Directive } from '@angular/core';
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
import { mapValueToObjWithProp, observableReducer } from '@pedro/utilities';
import { merge, Observable, Subject, Subscription } from 'rxjs';
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
  readonly componentState$: Observable<ProductsComponentState>;

  readonly query$: Subject<string> = new Subject<string>();

  readonly category$: Subject<Category> = new Subject<Category>();

  readonly orderBy$: Subject<Sort> = new Subject<Sort>();

  readonly pagination$: Subject<Pagination> = new Subject<Pagination>();

  readonly page$: Subject<number> = new Subject<number>();

  readonly categories: Option<Category | string>[] = PRODUCTS_CATEGORIES;

  readonly sortOptions: Option<Sort>[] = PRODUCTS_SORT_OPTIONS;

  protected readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store<ProductsPartialState>) {
    const storeSlice$ = this.store.pipe(select(selectProductComponentState));

    const page$ = this.page$.pipe(mapValueToObjWithProp('page'));

    this.componentState$ = observableReducer(
      PRODUCTS_COMPONENT_INITIAL_STATE,
      storeSlice$,
      page$
    );

    const categorySlice$ = this.category$
      .asObservable()
      .pipe(mapValueToObjWithProp('category'));

    const orderBySlice$ = this.orderBy$
      .asObservable()
      .pipe(mapValueToObjWithProp('orderBy'));

    const nameSlice$ = this.query$
      .asObservable()
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        mapValueToObjWithProp('name')
      );

    const filterChanges$ = observableReducer(
      CONTROLS_INITIAL_STATE,
      categorySlice$,
      orderBySlice$,
      nameSlice$
    ).pipe(startWith(CONTROLS_INITIAL_STATE), map(controlsToProductFilter));

    const requestMoreProducts$ = this.pagination$.asObservable().pipe(
      tap(({ offset }) => this.page$.next(offset / 10 + 1)),
      withLatestFrom(filterChanges$),
      tap(([pagination, filter]) =>
        this.store.dispatch(
          getMoreProducts({ payload: { ...filter, ...pagination } })
        )
      )
    );

    const requestProducts$ = filterChanges$.pipe(
      tap(() => this.page$.next(1)),
      tap((filter) => this.store.dispatch(getProducts({ payload: filter })))
    );

    const componentEffect$ = merge(requestProducts$, requestMoreProducts$);

    this.subscriptions.add(componentEffect$.subscribe());
  }
}
