import { merge, Observable } from 'rxjs';
import { scan, shareReplay } from 'rxjs/operators';

export function observableReducer<S>(
  initialState: S,
  ...stateSlice: Observable<Partial<S>>[]
): Observable<S> {
  return merge(...stateSlice).pipe(
    scan(
      (state: S, slice: Partial<S>) => ({ ...state, ...slice }),
      initialState
    ),
    shareReplay(1)
  );
}
