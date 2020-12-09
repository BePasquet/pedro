import { Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';

export function useState<T>(
  initialState: T
): [Observable<T>, (arg: T) => void] {
  const stateSubject = new Subject<T>();
  const state$ = stateSubject.asObservable().pipe(startWith(initialState));
  const setState = (state: T) => stateSubject.next(state);
  return [state$, setState];
}
