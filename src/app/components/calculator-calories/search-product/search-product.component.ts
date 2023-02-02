import { FoodItemMongoDb } from '../../../models/foodItemMongoDb';
import { CalculatorCaloriesService } from '../../../services/calculator-calories.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, fromEvent, of, Subscription } from 'rxjs';
import { debounceTime, mergeMap, distinctUntilChanged, toArray } from 'rxjs/operators';
import { FoodItem } from 'src/app/models/foodItem';
import { DomSanitizer } from '@angular/platform-browser';
import {response} from "express";

@Component({
    selector: 'search-product',
    templateUrl: './search-product.component.html',
    styleUrls: ['./search-product.component.scss']
})
export class SearchProductComponent implements OnInit, OnDestroy {

    @ViewChild("filter") filter: ElementRef;
    public _isEmptyResult: boolean = true;
    public _isEmptySearch: boolean = false;
    public isMiniLoaderLoadMore: boolean = false;
    public inputText: string = '';
    public isFullObj = false;
    public disablePrevBtn = true;
    public disableNextBtn = false;
    public dataLength: number = 0;
    public from: number = 0;
    public range: number = 5;
    public _data$: Observable<FoodItem[]>;
    public _TempData$: Observable<FoodItem[]>;
    public isProccessing: boolean = false;
    public isLoadMore: boolean = false;
    public isEmptyMoreResult: boolean = false;

    private _inputText: string;

    private _subscriptions: Array<Subscription>;

    constructor(private _calculatorService: CalculatorCaloriesService,
                private _sanitizer: DomSanitizer) {
        this.registerEvents();
    }

    private registerEvents(): void {
        const subscriptions: Array<Subscription> = [];

        subscriptions.push(this._calculatorService.registerOnsearch().subscribe((res: Array<FoodItem>) => {
            this._isEmptyResult = !res || res.length == 0;
            this._isEmptySearch = !res || res.length == 0;
            this.isProccessing = false;
            this.isLoadMore = false;
            this.isEmptyMoreResult = !this._calculatorService.productAlreadySearch.find(p => p.TextInput === this._inputText).HaveMoreResult;
            this._TempData$ = null;
            this._data$ = of(this._calculatorService.FoodList).pipe(
                debounceTime(1000),
                mergeMap(x => x),
                distinctUntilChanged(),
                toArray(),
            );

        }));

        subscriptions.push(this._calculatorService.registerOnRemoveProduct().subscribe((productId: string) => {
            this._data$.forEach(el => el.forEach(x => {
                if (x.Id == productId)
                    x.IsAdded = false
            }));
        }));

        subscriptions.push(this._calculatorService.registerOnClearTable().subscribe(() => {
            this._data$.forEach(el => el.forEach(x => x.IsAdded = false));
        }));

        subscriptions.push(this._calculatorService.registerOnEmptySearch().subscribe(() => {
            this.isProccessing = false;
        }));

        subscriptions.push(this._calculatorService.registerOnNoResult().subscribe(() => {
            this._isEmptySearch = true;
            this.isProccessing = false;
        }));

        this._subscriptions = subscriptions;
    }

    ngOnInit(): void {
    }

    onKey(event: any): Promise<void> {
        if (event.target.value.length == 0) {
            this._isEmptyResult = true;
            return;
        }
        else {
          this.isFullObj = true;
        }
      this._inputText = event.target.value;
      this.inputText = event.target.value;

        this._isEmptyResult = true;
        this._data$ = fromEvent(this.filter.nativeElement, 'keyup');
        this._data$.pipe(debounceTime(1000)).subscribe( (val) => {
          if (this.isProccessing) {
            return;
          }
          this.isProccessing = true;
          this._calculatorService.IsLoadMore = false;
          this._calculatorService.getProductsByInput(event.target.value, 0, 5).then(response => {
            this._data$ = response;
            if (response.length > 0) {
              this._isEmptyResult = false;
            }
          });
        });

    }

  // tslint:disable-next-line:typedef
  trackByIndex(index, item) {
    if(!item) return null;
    return item && item.id; // or item.id
  }

  convertToBase64(event: any): string {
    this.isLoadMore = false;
    this.isProccessing = false;
    if(event.Image.length > 0) {
      return 'data:image/jpg;base64,' + (this._sanitizer.bypassSecurityTrustResourceUrl(event.Image) as any).changingThisBreaksApplicationSecurity;
    }
    else {
      let errImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";
      return 'data:image/jpg;base64,' + (this._sanitizer.bypassSecurityTrustResourceUrl(errImage) as any).changingThisBreaksApplicationSecurity;
    }
  }

    public async onAddItem(item: FoodItem | FoodItemMongoDb): Promise<void> {
        item.IsAdded = true;
        item.Quantity = item.Quantity == 0 ? 100 : item.Quantity;

        if (item instanceof FoodItemMongoDb) {
            let mongoItem = item as FoodItemMongoDb;
            if (mongoItem.Fats) {
                this._calculatorService.addItemFromMongo(mongoItem);
                return;
            }
        }

        await this._calculatorService.getItemIngredients(item, this.inputText, this.from, this.range);
    }

    public loadMore(): void {
        this.from = this.from + 5;
        if(this.from > 0) {
          this.disablePrevBtn = false;
        }
        this.isLoadMore = true;
        this.isMiniLoaderLoadMore = true;
        this.isEmptyMoreResult  = false;
        this._calculatorService.IsLoadMore = true;
        this._calculatorService.getMoreItems();
        this._calculatorService.getProductsByInput(this._inputText, this.from, this.range).then( response => {
            // @ts-ignore
          console.log(this._data$);
          document.querySelector('#list').scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (response.length > 0) {
            this.isMiniLoaderLoadMore = false;
          }
          this._data$ = response;
        });
    }

  public goToPreviousResults(): void {
    this.from = this.from - 5;
    if(this.from === 0) {
      this.disablePrevBtn = true;
    }
    this.isLoadMore = true;
    this.isMiniLoaderLoadMore = true;
    this.isEmptyMoreResult  = false;
    this._calculatorService.IsLoadMore = true;
    this._calculatorService.getMoreItems();
    this._calculatorService.getProductsByInput(this._inputText, this.from, this.range).then( response => {
      // @ts-ignore
      console.log(this._data$);
      document.querySelector('#list').scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (response.length > 0) {
        this.isMiniLoaderLoadMore = false;
      }
      this._data$ = response;
    });
  }

    onBlur(): void {
        this._isEmptyResult = true;
    }

    private clearSubscriptions(): void {
        this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._subscriptions = [];
    }

    ngOnDestroy(): void {
        this.clearSubscriptions();
    }

}
