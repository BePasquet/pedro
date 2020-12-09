import { ChangeDetectorRef, Directive } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { select, Store } from '@ngrx/store';
import {
  getMoreProducts,
  getProducts,
  ProductsPartialState,
} from '@pedro/core';
import { Category, Pagination } from '@pedro/data';
import {
  FunctionComponentBridge,
  observableReducer,
  useObservableReducer,
} from '@pedro/utilities';
import { merge, Subject } from 'rxjs';
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
  selectProductComponentState,
} from './products.helper';

interface ProductsComponentProps {
  store: Store<ProductsPartialState>;
}

const productsComponent = ({ store }: ProductsComponentProps) => () => {
  const storeSlice$ = store.pipe(select(selectProductComponentState));

  const [state$, setState] = useObservableReducer(
    {
      ...PRODUCTS_COMPONENT_INITIAL_STATE,
      categories: PRODUCTS_CATEGORIES,
      sortOptions: PRODUCTS_SORT_OPTIONS,
      paginationLimit: PAGINATION_INITIAL_STATE.limit,
    },
    storeSlice$
  );

  const query$ = new Subject<string>();

  const category$ = new Subject<Category>();

  const orderBy$ = new Subject<Sort>();

  const pagination$ = new Subject<Pagination>();

  const controls = {
    query$,
    category$,
    orderBy$,
    pagination$,
    setState,
  };

  const categorySlice$ = category$.pipe(map((category) => ({ category })));

  const orderBySlice$ = orderBy$.pipe(map((orderBy) => ({ orderBy })));

  const nameSlice$ = query$.pipe(
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

  const requestProducts$ = filterChanges$.pipe(
    tap((filter) => {
      setState({ page: 1 });
      store.dispatch(getProducts({ payload: filter }));
    })
  );

  const requestMoreProducts$ = pagination$.pipe(
    withLatestFrom(filterChanges$),
    tap(([pagination, filter]) => {
      setState({
        page: pagination.offset / PAGINATION_INITIAL_STATE.limit + 1,
      });

      store.dispatch(
        getMoreProducts({ payload: { ...filter, ...pagination } })
      );
    })
  );

  const effects$ = merge(requestProducts$, requestMoreProducts$);
  return { state$, effects$, controls };
};

@Directive()
export class ProductsFunctionComponent extends FunctionComponentBridge<
  ProductsComponentState
> {
  constructor(
    store: Store<ProductsPartialState>,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(productsComponent({ store }), changeDetectorRef);
  }
}
