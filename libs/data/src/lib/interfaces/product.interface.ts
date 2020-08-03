import { Category } from '../enum';

export interface Product {
  id: number | string;
  name: string;
  price: string;
  imgUrl: string;
  category: Category;
}
