import { createSelector } from '@ngrx/store';
import {
  selectProducts,
  selectProductsError,
  selectProductsLoaded,
  selectProductsLoading,
  selectProductsTotal,
} from '@pedro/core';
import { Pagination, ProductFilter } from '@pedro/data';
import { ProductsComponentState } from '../../core/interfaces/products-component-state.interface';
import { ProductsControls } from '../../core/interfaces/products.controls.interface';

export const PAGINATION_INITIAL_STATE: Pagination = {
  limit: 10,
  offset: 0,
};

export const CONTROLS_INITIAL_STATE: ProductsControls = {
  name: '',
  category: null,
  orderBy: {
    active: null,
    direction: null,
  },
};

export const PRODUCTS_COMPONENT_INITIAL_STATE: ProductsComponentState = {
  products: [],
  loading: false,
  loaded: false,
  total: 0,
  error: null,
  page: 1,
};

export function controlsToProductFilter({
  category,
  orderBy: { active, direction },
  name,
}: ProductsControls): ProductFilter {
  let orderBy = {};

  if (!!direction) {
    orderBy = { [active]: direction };
  }

  return {
    name,
    category: !!category ? category : null,
    ...PAGINATION_INITIAL_STATE,
    orderBy,
  };
}

export const selectProductComponentState = createSelector(
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
