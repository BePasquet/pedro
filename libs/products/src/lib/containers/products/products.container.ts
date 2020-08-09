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
    /*
      Hi Ben i write some comments to walk you through so is not so tedious to read
      hope you don't grab your head when you see the code haha
    */

    /* 
      Global state the selector is on top of the component this will be used data 
      from store on the component in this case is products state but can be a composition of product, user, etc
    */
    const storeSlice$ = this.store.pipe(select(selectProductComponentState));

    /* 
      Represents state that is contain in the component and can change state can be updated via setSate ex: this.setState.next({page: 1, ...etc});
    */
    const componentStateSlice$ = this.setState.asObservable();

    /*
      Method to merge component state with global state from store, when components get to big i don't know if is it better
      to use a reducer actions and effects for component state.
      also trigger change detection on observable next this is use for zoneless app (ecommerce mobile ngZone is set noop)
    */
    const state$ = stateChanges(
      PRODUCTS_COMPONENT_INITIAL_STATE,
      storeSlice$,
      componentStateSlice$
    ).pipe(
      tap((state) => {
        this.state = state;
        this.changeDetectorRef.detectChanges();
      })
    );

    this.subscriptions.add(state$.subscribe());

    /*
      The code bellow works in the same way instead of keep in state of component keep state of filter
      i started using this pattern with merge and scan, before i was using combineLatest as 

      ``
          combineLatest([this.category$, this.orderBy$, this.query$])
          .pipe(
            map(([category, sort, name]) => ({ category, sort, name }))
          );
      ``
      i don't know what will be better
    */
    const categorySlice$ = this.category$
      .asObservable()
      .pipe(map((category) => ({ category })));

    const orderBySlice$ = this.orderBy$
      .asObservable()
      .pipe(map((orderBy) => ({ orderBy })));

    const nameSlice$ = this.query$.asObservable().pipe(
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

    const requestMoreProducts$ = this.pagination$.asObservable().pipe(
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

    /* 
      this is just not to do 
      this.subscriptions.add(requestProducts$$.subscribe());
      this.subscriptions.add(requestMoreProducts$.subscribe());
    */
    const effects$ = merge(requestProducts$, requestMoreProducts$);

    this.subscriptions.add(effects$.subscribe());
  }
}
