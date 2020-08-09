import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Products } from '@pedro/products';
@Component({
  selector: 'pedro-products-mobile',
  templateUrl: './products-mobile.component.html',
  styleUrls: ['./products-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsMobileComponent extends Products {}
