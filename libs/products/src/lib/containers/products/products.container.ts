import { Directive } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { select, Store } from '@ngrx/store';
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
import { Category, Pagination, Product, ServerError } from '@pedro/data';
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
import {
  controlsToProductFilter,
  CONTROLS_INITIAL_STATE,
} from './products.helper';

@Directive()
export class Products {
  page = 1;

  readonly query$: Subject<string> = new Subject<string>();

  readonly category$: Subject<Category> = new Subject<Category>();

  readonly orderBy$: Subject<Sort> = new Subject<Sort>();

  readonly pagination$: Subject<Pagination> = new Subject<Pagination>();

  readonly products$: Observable<Product[]> = this.store.pipe(
    select(selectProducts)
  );

  readonly loading$: Observable<boolean> = this.store.pipe(
    select(selectProductsLoading)
  );

  readonly loaded$: Observable<boolean> = this.store.pipe(
    select(selectProductsLoaded)
  );

  readonly total$: Observable<number> = this.store.pipe(
    select(selectProductsTotal)
  );

  readonly error$: Observable<ServerError> = this.store.pipe(
    select(selectProductsError)
  );

  readonly categories: Option<Category | string>[] = PRODUCTS_CATEGORIES;

  readonly sortOptions: Option<Sort>[] = PRODUCTS_SORT_OPTIONS;

  protected readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store<ProductsPartialState>) {
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
      tap(() => (this.page = this.page + 1)),
      withLatestFrom(filterChanges$),
      tap(([pagination, filter]) =>
        this.store.dispatch(
          getMoreProducts({ payload: { ...filter, ...pagination } })
        )
      )
    );

    const requestProducts$ = filterChanges$.pipe(
      tap(() => (this.page = 1)),
      tap((filter) => this.store.dispatch(getProducts({ payload: filter })))
    );

    const componentEffect$ = merge(requestProducts$, requestMoreProducts$);

    this.subscriptions.add(componentEffect$.subscribe());
  }
}
