import { merge, Observable } from 'rxjs';
import { scan, share } from 'rxjs/operators';

export function observableReducer<S>(
  initialState: S,
  ...stateSlice: Observable<Partial<S>>[]
): Observable<S> {
  return merge(...stateSlice).pipe(
    scan(
      (state: S, slice: Partial<S>) => ({ ...state, ...slice }),
      initialState
    ),
    share()
  );
}
