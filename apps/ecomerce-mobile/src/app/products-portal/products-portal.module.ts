import { NgModule } from '@angular/core';
import { ProductsMobileModule } from '@pedro/products-mobile';
import { ProductsPortalRoutingModule } from './products-portal-routing.module';
@NgModule({
  imports: [ProductsMobileModule, ProductsPortalRoutingModule],
})
export class ProductPortalModule {}
