import { createAction, props } from '@ngrx/store';
import {
  Product,
  ProductFilter,
  ResultsWithTotal,
  ServerError,
} from '@pedro/data';

export const getProducts = createAction(
  '[Product] Get Products',
  props<{ payload: ProductFilter }>()
);

export const getProductsSuccess = createAction(
  '[Product] Get Product Success',
  props<{ payload: ResultsWithTotal<Product> }>()
);

export const getProductsFail = createAction(
  '[Product] Get Product Fail',
  props<{ payload: ServerError }>()
);

export const getMoreProducts = createAction(
  '[Product] Get More Products',
  props<{ payload: ProductFilter }>()
);

export const getMoreProductsSuccess = createAction(
  '[Product] Get Product More Success',
  props<{ payload: ResultsWithTotal<Product> }>()
);

export const getMoreProductsFail = createAction(
  '[Product] Get More Product Fail',
  props<{ payload: ServerError }>()
);

export type ProductsActions = ReturnType<
  | typeof getProducts
  | typeof getProductsSuccess
  | typeof getProductsFail
  | typeof getMoreProducts
  | typeof getMoreProductsSuccess
  | typeof getMoreProductsFail
>;
