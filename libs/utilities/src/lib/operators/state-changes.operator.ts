import { asapScheduler, Observable } from 'rxjs';
import { observeOn, startWith } from 'rxjs/operators';
import { observableReducer } from './observable-reducer.operator';

export function stateChanges<S>(
  initialState: S,
  ...stateSlice: Observable<Partial<S>>[]
) {
  return observableReducer(initialState, ...stateSlice).pipe(
    startWith(initialState),
    observeOn(asapScheduler)
  );
}
