import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  productsAdapter,
  ProductsState,
  PRODUCTS_STATE_KEY,
} from './products.reducer';

const { selectAll, selectEntities } = productsAdapter.getSelectors();

export const selectProductsState = createFeatureSelector<ProductsState>(
  PRODUCTS_STATE_KEY
);

export const selectProducts = createSelector(selectProductsState, selectAll);

export const selectProductsEntities = createSelector(
  selectProductsState,
  selectEntities
);

export const selectProductsTotal = createSelector(
  selectProductsState,
  ({ total }) => total
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  ({ loading }) => loading
);

export const selectProductsLoaded = createSelector(
  selectProductsState,
  ({ loaded }) => loaded
);

export const selectProductsError = createSelector(
  selectProductsState,
  ({ error }) => error
);
