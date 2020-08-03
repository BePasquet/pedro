import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Product, ProductFilter, ResultsWithTotal } from '@pedro/data';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ENVIRONMENT_TOKEN_KEY } from '../const';
import { Environment } from '../interfaces/environment.interface';
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ENVIRONMENT_TOKEN_KEY) private readonly environment: Environment
  ) {}

  // query params as filter to match json-server api
  getProducts({
    limit,
    offset,
    category,
    orderBy,
    name,
  }: ProductFilter): Observable<ResultsWithTotal<Product>> {
    let queryParams = new HttpParams();

    queryParams = queryParams
      .append('_start', `${offset}`)
      .append('_limit', `${limit}`);

    if (!!category) {
      queryParams = queryParams.append('category', category);
    }

    if (!!Object.keys(orderBy).length) {
      for (const [prop, direction] of Object.entries(orderBy)) {
        queryParams = queryParams.append('_sort', prop);
        queryParams = queryParams.append('_order', direction);
      }
    }

    if (!!name) {
      queryParams = queryParams.append('q', name);
    }

    return this.http
      .get<any>(`${this.environment.apiURI}/products`, {
        params: queryParams,
        observe: 'response',
      })
      .pipe(
        delay(1000),
        map((response) => ({
          results: response.body,
          total: parseInt(response.headers.get('X-Total-Count'), 10),
        }))
      );
  }
}
