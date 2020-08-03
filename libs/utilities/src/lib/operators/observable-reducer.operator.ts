import { merge, Observable } from 'rxjs';
import { scan, share } from 'rxjs/operators';

export function observableReducer<S>(
  initialState: S,
  ...statePieces: Observable<Partial<S>>[]
): Observable<S> {
  return merge(...statePieces).pipe(
    scan(
      (state: S, payload: Partial<S>) => ({ ...state, ...payload }),
      initialState
    ),
    share()
  );
}
