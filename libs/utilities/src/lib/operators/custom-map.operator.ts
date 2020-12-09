import { Observable } from 'rxjs';

export function map<T, R>(
  project: (value: T) => R
): (source$: Observable<T>) => Observable<R> {
  return (source$: Observable<T>) =>
    new Observable<R>((subscriber) => {
      source$.subscribe({
        next: (value) => {
          let result: R;
          try {
            result = project(value);
          } catch (e) {
            subscriber.error(e);
            return;
          }
          subscriber.next(result);
        },
        error: subscriber.error,
        complete: subscriber.complete,
      });
    });
}
