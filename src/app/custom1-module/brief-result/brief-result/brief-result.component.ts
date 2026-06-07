import {Component, inject, Input, OnInit} from '@angular/core';
import {createFeatureSelector, createSelector, Store} from "@ngrx/store";
import {AsyncPipe} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

const viewConfigFeatureSelector = createFeatureSelector('viewConfig');

const selectUserFeature = createFeatureSelector<{isLoggedIn: boolean}>('user');
const selectIsLoggedIn = createSelector(selectUserFeature, state => state.isLoggedIn);

@Component({
  selector: 'custom-brief-result',
  standalone: true,
  templateUrl: './brief-result.component.html',
  imports: [
    AsyncPipe,
    TranslateModule,
    MatButtonModule,
    MatTooltipModule
  ],
  styleUrl: './brief-result.component.scss'
})
export class BriefResultComponent implements OnInit{

  @Input() private hostComponent!: any;

  private store = inject(Store);
  private translateService = inject(TranslateService);

  searchResult: any;

  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  isLoggedIn = this.store.selectSignal(selectIsLoggedIn);
   currentLang!: string;

  constructor() {
    this.translateService.stream('delivery.code.ext_not_restricted').pipe(
      takeUntilDestroyed(),
      tap(res => console.log('this is the translated code: ' + res))
    ).subscribe()
  }

  ngOnInit(): void {
    this.translateService.stream('delivery.code.ext_not_restricted').pipe(
      tap(res => console.log(res))
    ).subscribe()
    this.searchResult = this.hostComponent.searchResult;
    console.log(this.hostComponent);
    this.store.select(viewConfigFeatureSelector).subscribe(config => console.table(config));
    this.currentLang = this.translateService.currentLang;
  }

}
