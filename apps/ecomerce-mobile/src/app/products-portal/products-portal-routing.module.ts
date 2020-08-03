import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsMobileComponent } from '@pedro/products-mobile';

const routes: Routes = [
  {
    path: '',
    component: ProductsMobileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsPortalRoutingModule {}
