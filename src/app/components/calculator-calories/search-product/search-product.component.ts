import { FoodItemMongoDb } from './../../../models/foodItemMongoDb';
import { CalculatorCaloriesService } from './../../../services/calculator-calories.service';
import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, fromEvent, of, Subscription, ObservableInput} from 'rxjs';
import {debounceTime, mergeMap, distinctUntilChanged, toArray, repeat} from 'rxjs/operators';
import { FoodItem } from 'src/app/models/foodItem';
import { DomSanitizer } from '@angular/platform-browser';
import {HttpResponse} from '@angular/common/http';

@Component({
    selector: 'search-product',
    templateUrl: './search-product.component.html',
    styleUrls: ['./search-product.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchProductComponent implements OnInit, OnDestroy {
    @ViewChild("filter") filter: ElementRef;
    public _isEmptyResult: boolean = true;
    public _isEmptySearch: boolean = false;
    public newData$: Object | void;
    public isProccessing: boolean = false;
    public isLoadMore: boolean = false;
    public test: boolean = false;
    public isEmptyMoreResult: boolean = false;
    private _inputText: string;
    public from: number = 0;
    public range: number = 5;
    public startIndex: number = 0;
    public constRange = 5;

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
            // this.isEmptyMoreResult = this._calculatorService.IsEmptyResult;
            this.isEmptyMoreResult = !this._calculatorService.productAlreadySearch.find(p => p.TextInput === this._inputText).HaveMoreResult;

            // this.newData = of(this._calculatorService.FoodList).pipe(
            //     debounceTime(1000),
            //     mergeMap(x => x),
            //     distinctUntilChanged(),
            //     toArray(),
            // );

        }));


        subscriptions.push(this._calculatorService.registerOnClearTable().subscribe(() => {
            // @ts-ignore
          this.newData$.forEach(el => el.forEach(x => x.IsAdded = false));
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

    convertToBase64(event: any): string {
      this.isLoadMore = false;
      this.isProccessing = false;
      this.test = true;
      if(event.imgBase64.length > 0) {
         return 'data:image/jpg;base64,' + (this._sanitizer.bypassSecurityTrustResourceUrl(event.imgBase64) as any).changingThisBreaksApplicationSecurity;
      }
      else {
        let errImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";
        return 'data:image/jpg;base64,' + (this._sanitizer.bypassSecurityTrustResourceUrl(errImage) as any).changingThisBreaksApplicationSecurity;
      }
    }

    onKey(event: any): Promise<void> {
        if (event.target.value.length == 0) {
            this._isEmptyResult = true;
            return;
        }
        this.isLoadMore = true;
        this._inputText = event.target.value;
        this._isEmptyResult = true;

          this.newData$ = fromEvent(this.filter.nativeElement, 'keyup');
          console.log(this.newData$)
          // this.newData$.pipe(debounceTime(1000)).subscribe((val) => {
          //     if (this.isProccessing)
          //         return;
          //
          //     this.isProccessing = true;
          //     console.log('ok until here');
          //     this.newData$ = this._calculatorService.getNewProductsByInput(event.target.value);
          //     this.isProccessing = false;
          //   console.log('this new Data:');
          //     console.log(this.newData$);
          // });
          this.newData$ = this._calculatorService.getNewProductsByInput(event.target.value, this.from, this.range);
    }

    public async onAddItem(item: FoodItem | FoodItemMongoDb): Promise<void> {
      console.log(item);
        item.IsAdded = true;
        item.Quantity = item.Quantity == 0 ? 100 : item.Quantity;

        if (item instanceof FoodItemMongoDb) {
            let mongoItem = item as FoodItemMongoDb;
            if (mongoItem.Fats) {
                this._calculatorService.addItemFromMongo(mongoItem);
                return;
            }
        }
        await this._calculatorService.getItemIngredients(item);
    }

    public loadMore(): void {
      this.test = false;
      this.isLoadMore = true;
      this._calculatorService.IsLoadMore = true;
      this._calculatorService.getMoreItems();
      this.constRange = 5 + this.constRange;
      // this.newData$ = this._calculatorService.getNewProductsByInput(this._inputText, 5, 10);
      this.newData$ = this._calculatorService.getNewProductsByInput(this._inputText, this.startIndex, this.constRange);
      // console.log(this.newData$.length)

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
