import { Sort } from '@angular/material/sort';
import { Option } from '@pedro/core';

export const PRODUCTS_SORT_OPTIONS: Option<Sort>[] = [
  {
    label: 'None',
    value: { active: null, direction: null },
  },
  {
    label: 'price low to high',
    value: { active: 'price', direction: 'asc' },
  },
  {
    label: 'price high to low',
    value: { active: 'price', direction: 'desc' },
  },
];
