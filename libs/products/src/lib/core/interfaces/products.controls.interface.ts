import { Sort } from '@angular/material/sort';
import { Category } from '@pedro/data';

export interface ProductsControls {
  name: string;
  category: Category;
  orderBy: Sort;
}
