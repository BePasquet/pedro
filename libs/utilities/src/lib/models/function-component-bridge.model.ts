import { ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';
import { asapScheduler, Observable, Subscription } from 'rxjs';
import { observeOn, tap } from 'rxjs/operators';

@Directive()
export class FunctionComponentBridge<S> implements OnDestroy {
  state: S;

  readonly state$: Observable<S>;

  readonly controls: any;

  private readonly effects$: Observable<any>;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    fnComponent: () => {
      state$: Observable<S>;
      effects$: Observable<any>;
      controls: {};
    },
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    const { state$, effects$, controls } = fnComponent();

    this.state$ = state$.pipe(
      observeOn(asapScheduler),
      tap((state) => {
        this.state = state;
        this.changeDetectorRef.detectChanges();
      })
    );

    this.effects$ = effects$;
    this.controls = controls;
    this.subscriptions.add(this.state$.subscribe());
    this.subscriptions.add(this.effects$.subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
