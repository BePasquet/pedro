import { ProductFilter } from '@pedro/data';
import { ProductsControls } from '../../core/interfaces/products.controls.interface';

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
    limit: 10,
    offset: 0,
    orderBy,
  };
}

export const CONTROLS_INITIAL_STATE: ProductsControls = {
  name: '',
  category: null,
  orderBy: {
    active: null,
    direction: null,
  },
};
