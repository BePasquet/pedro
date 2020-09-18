import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Option } from '@pedro/core';
import { Category } from '@pedro/data';

@Directive()
export class ProductsFilter {
  @Input()
  categories: Option<Category | string>[];

  @Input()
  sortOptions: Option<Sort>[];

  @Output()
  textChange: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  orderByChange: EventEmitter<Sort> = new EventEmitter<Sort>();

  @Output()
  categoryChange: EventEmitter<Category | string> = new EventEmitter<
    Category | string
  >();
}
