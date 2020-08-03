import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Product, ServerError } from '@pedro/data';
import {
  getMoreProducts,
  getMoreProductsFail,
  getMoreProductsSuccess,
  getProducts,
  getProductsFail,
  getProductsSuccess,
  ProductsActions,
} from './products.actions';

export const PRODUCTS_STATE_KEY = 'products';

export interface ProductsState extends EntityState<Product> {
  loading: boolean;
  loaded: boolean;
  total: number;
  error: ServerError;
}

export interface ProductsPartialState {
  [PRODUCTS_STATE_KEY]: ProductsState;
}

export const productsAdapter = createEntityAdapter<Product>();

export const productInitialState = productsAdapter.getInitialState({
  loading: false,
  loaded: false,
  total: 0,
  error: null,
});

const reducer = createReducer(
  productInitialState,
  on(getProducts, (state) =>
    productsAdapter.removeAll({
      ...state,
      loading: true,
      total: 0,
      loaded: false,
      error: null,
    })
  ),
  on(getProductsSuccess, (state, { payload: { results, total } }) =>
    productsAdapter.setAll(results, {
      ...state,
      loading: false,
      loaded: true,
      error: null,
      total,
    })
  ),
  on(getProductsFail, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: false,
    error: payload,
  })),
  on(getMoreProducts, (state) => ({ ...state, loading: true, error: null })),
  on(getMoreProductsSuccess, (state, { payload: { results, total } }) =>
    productsAdapter.addMany(results, { ...state, loading: false, total })
  ),
  on(getMoreProductsFail, (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  }))
);

export function productsReducer(
  state: ProductsState,
  action: ProductsActions
): ProductsState {
  return reducer(state, action);
}
