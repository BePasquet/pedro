import { Option } from '@pedro/core';
import { Product, ServerError } from '@pedro/data';

export interface ProductsComponentState {
  products: Product[];
  loading: boolean;
  loaded: boolean;
  total: number;
  error: ServerError;
  page: number;
  categories?: Option<any>[];
  sortOptions?: Option<any>[];
}
