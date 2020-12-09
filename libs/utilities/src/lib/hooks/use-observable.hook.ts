import { merge, Observable, Subject } from 'rxjs';
import { scan, shareReplay, startWith } from 'rxjs/operators';

export function useObservableReducer<S>(
  initialState: S,
  ...stateSlice: Observable<Partial<S>>[]
): [Observable<S>, (arg: Partial<S>) => void] {
  const stateSubject = new Subject<Partial<S>>();
  const setState = (state: Partial<S>) => stateSubject.next(state);
  const state$ = merge(...stateSlice, stateSubject).pipe(
    startWith(initialState),
    scan(
      (state: S, slice: Partial<S>) => ({ ...state, ...slice }),
      initialState
    ),
    shareReplay(1)
  );

  return [state$, setState];
}
