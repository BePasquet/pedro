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
import {
  Category,
  Pagination,
  Product,
  ProductFilter,
  ServerError,
} from '@pedro/data';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  scan,
  shareReplay,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

interface ProductsControls {
  name: string;
  category: Category;
  orderBy: Sort;
}

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

  readonly categories: Option<Category | string>[] = [
    {
      label: 'All',
      value: null,
    },
    {
      label: 'Books',
      value: Category.Book,
    },
    {
      label: 'Movies',
      value: Category.Movie,
    },
  ];

  readonly sortOptions: Option<Sort>[] = [
    {
      label: 'None',
      value: { active: null, direction: null },
    },
    {
      label: 'price low to high',
      value: { active: 'price', direction: 'asc' },
    },
    {
      label: 'price high to low',
      value: { active: 'price', direction: 'desc' },
    },
  ];

  protected readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store<ProductsPartialState>) {
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

    const controlsToProductFilter = ({
      category,
      orderBy: { active, direction },
      name,
    }: ProductsControls) => {
      let orderBy = {};

      if (!!direction) {
        orderBy = { [active]: direction };
      }

      const filter: ProductFilter = {
        name,
        category: !!category ? category : null,
        limit: 10,
        offset: 0,
        orderBy,
      };

      return filter;
    };

    const initialControlsState = {
      name: '',
      category: null,
      orderBy: {
        active: null,
        direction: null,
      },
    };

    const filterChanges$ = merge(
      categorySlice$,
      orderBySlice$,
      nameSlice$
    ).pipe(
      startWith(initialControlsState),
      scan((state, slice) => ({ ...state, ...slice }), initialControlsState),
      map(controlsToProductFilter),
      shareReplay(1)
    );

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
