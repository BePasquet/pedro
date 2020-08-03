import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ProductService } from '../../services';
import {
  getMoreProducts,
  getMoreProductsFail,
  getMoreProductsSuccess,
  getProducts,
  getProductsFail,
  getProductsSuccess,
} from './products.actions';

@Injectable()
export class ProductsEffect {
  getProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getProducts),
      switchMap(({ payload }) =>
        this.productsService.getProducts(payload).pipe(
          map((response) => getProductsSuccess({ payload: response })),
          catchError(({ error }) => of(getProductsFail({ payload: error })))
        )
      )
    )
  );

  getMoreProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getMoreProducts),
      switchMap(({ payload }) =>
        this.productsService.getProducts(payload).pipe(
          map((response) => getMoreProductsSuccess({ payload: response })),
          catchError(({ error }) => of(getMoreProductsFail({ payload: error })))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly productsService: ProductService
  ) {}
}
