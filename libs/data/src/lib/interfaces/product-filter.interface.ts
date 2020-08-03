import { Category } from '../enum';
import { ProductsOrderBy } from '../types';
import { Pagination } from './pagination.interface';

export interface ProductFilter extends Pagination {
  name: string;
  category: Category;
  orderBy: Partial<ProductsOrderBy>;
}
