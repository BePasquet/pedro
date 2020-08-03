import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function mapValueToObjWithProp<T>(key: string) {
  return (source$: Observable<T>) =>
    source$.pipe(map((value) => ({ [key]: value })));
}
