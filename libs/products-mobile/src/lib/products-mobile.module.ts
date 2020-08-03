import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import {
  ProductsEffect,
  productsReducer,
  PRODUCTS_STATE_KEY,
} from '@pedro/core';
import { ProductsMobileComponent } from './containers/products-mobile/products-mobile.component';

@NgModule({
  declarations: [ProductsMobileComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature(PRODUCTS_STATE_KEY, productsReducer),
    EffectsModule.forFeature([ProductsEffect]),
    FlexLayoutModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginatorModule,
  ],
})
export class ProductsMobileModule {}
