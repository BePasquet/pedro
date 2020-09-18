import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductsFilter } from '@pedro/products';

@Component({
  selector: 'pedro-products-filter',
  templateUrl: './products-filter.component.html',
  styleUrls: ['./products-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFilterComponent extends ProductsFilter {}
