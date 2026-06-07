import {Component, inject, InjectionToken, Injector} from '@angular/core';
import {createFeatureSelector, createSelector, Store} from "@ngrx/store";
import {NavigationEnd, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {TranslateModule} from "@ngx-translate/core";
// import {SHELL_ROUTER} from "../../injection-tokens";

const selectUserFeature = createFeatureSelector<{isLoggedIn: boolean}>('user');
const selectIsLoggedIn = createSelector(selectUserFeature, state => state.isLoggedIn);
@Component({
  selector: 'custom-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
  imports: [TranslateModule],
  standalone: true
})
export class RecommendationsComponent {
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  isLoggedInSignal = this.store.selectSignal(selectIsLoggedIn);
  // private routerSubscription: Subscription;
  // private router = inject(SHELL_ROUTER);
  constructor(private store: Store, private injector: Injector) {
    // this.routerSubscription = this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     (window as any)._paq.push(['setCustomUrl', event.urlAfterRedirects]);
    //     (window as any)._paq.push(['trackPageView']);
    //     console.log('Tracking PageView: ', event.urlAfterRedirects);
    //   }
    // });

  }

}
