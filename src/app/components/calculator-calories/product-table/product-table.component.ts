import { CalculatorCaloriesService } from './../../../services/calculator-calories.service';
import { Component, OnDestroy } from '@angular/core';
import { Ingredients } from 'src/app/models/Ingredients';
import { FoodItem } from 'src/app/models/foodItem';
import { Subscription } from 'rxjs';

@Component({
    selector: 'product-table',
    templateUrl: './product-table.component.html',
    styleUrls: ['./product-table.component.scss']
})
export class ProductTableComponent implements OnDestroy {

    public _table: Array<Ingredients> = [];
    public CaloriesSum: number = 0;
    public FatsSum: number = 0;
    public CarbohydratesSum: number = 0;
    public ProteinsSum: number = 0;
    public DessertSum: number = 0;

    private _subscriptions: Array<Subscription>;

    constructor(private _calculatorService: CalculatorCaloriesService) {
        this.registerEvents();
    }

    private registerEvents(): void {
        const subscriptions: Array<Subscription> = [];

        subscriptions.push(this._calculatorService.registerOnfoodTableChange().subscribe((res: Array<Ingredients>) => {
              if(res !== undefined) {
                if(res[res.length -1] !== undefined && res[res.length -1]['moreDetails']) {
                  this.FatsSum += Number(res[res.length -1]['moreDetails']?.find(t=>t.code === "79007").fields[0].value);
                  this.CarbohydratesSum += Number(res[res.length -1]['moreDetails']?.find(t=>t.code === "79003").fields[0].value);
                  this.ProteinsSum += Number(res[res.length -1]['moreDetails']?.find(t=>t.code === "79002").fields[0].value);
                  if(res[res.length -1]['moreDetails']?.find(t=>t.code === "79004") !== undefined) {
                    this.DessertSum += Number(res[res.length -1]['moreDetails']?.find(t=>t.code === "79004").fields[0].value) / 4 ;
                  }
                  else {
                    this.DessertSum += 0;
                  }
                }
                else {
                  this.FatsSum += res[res.length -1].Fats;
                  this.CarbohydratesSum += res[res.length -1].Carbohydrates;
                  this.ProteinsSum += res[res.length -1].Proteins;
                  this.DessertSum += res[res.length -1].Dessert;
                }
              }



          // for (let i=0; i< res.length; i++) {
          //   this.FatsSum += Number(res[i]['moreDetails'].find(t=>t.code === "79007").fields[0].value);
          //   this.CarbohydratesSum += Number(res[i]['moreDetails'].find(t=>t.code === "79003").fields[0].value);
          //   this.ProteinsSum += Number(res[i]['moreDetails'].find(t=>t.code === "79002").fields[0].value);
          //   // console.log(res[i]['moreDetails'].find(t=>t.code === "79007").fields[0].value);//fats
          //   // console.log(res[i]['moreDetails'].find(t=>t.code === "79003").fields[0].value);//carb
          //   // console.log(res[i]['moreDetails'].find(t=>t.code === "79002").fields[0].value);//protein
          // }
          // console.log(typeof res[0]['moreDetails'].find(t=>t.code === "79007").fields[0].value);//fats
          // console.log(typeof res[0]['moreDetails'].find(t=>t.code === "79003").fields[0].value);//carb
          // console.log(typeof res[0]['moreDetails'].find(t=>t.code === "79002").fields[0].value);//protein
          // console.log(this.FatsSum);
          // console.log(this.CarbohydratesSum);
          // console.log(this.ProteinsSum);
          // console.log(this.DessertSum);
          // this.CaloriesSum = 0;
            // this.CarbohydratesSum = 0;
            // this.FatsSum = 0;
            // this.ProteinsSum = 0;
            // this.DessertSum = 0;
            // res.forEach(item => {
            //     this.CaloriesSum += item.Calories;
            //     this.CarbohydratesSum += item.Carbohydrates;
            //     this.FatsSum += item.Fats;
            //     this.ProteinsSum += item.Proteins;
            //     this.DessertSum += item.Dessert;
            // })

            this._table = res;
        }));

        this._subscriptions = subscriptions;
    }

    public async onRemoveItem(item: FoodItem): Promise<void> {
        console.log(item);
        let index = this._calculatorService.removeItem(item);
        console.log(index);
        this._table.splice(index, 1);

    }

    public clear(): void {
        this._calculatorService.clearTable();
        this._table = [];
    }

    private clearSubscriptions(): void {
        this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._subscriptions = [];
    }

    public getCalories(event) {
      if(event.moreDetails) {
        const filtered = event.moreDetails.find(t=>t.code === "79001");
        this.ProteinsSum += filtered.fields[0].value;
        return (filtered.fields[0].value);
      }
    }

  public getFats(event) {
    if(event.moreDetails) {
      const filtered = event.moreDetails.find(t=>t.code === "79007");
      if(filtered) {
        return filtered.fields[0].value;
      }
    }
  }

  public getCarbohydrates(event) {
    if(event.moreDetails) {
      const filtered = event.moreDetails.find(t=>t.code === "79003");
      // this.CarbohydratesSum += filtered.fields[0].value;
      if(filtered) {
        return filtered.fields[0].value;
      }
    }
  }

  public getProteins(event) {
    if(event.moreDetails) {
      const filtered = event.moreDetails.find(t=>t.code === "79002");
      if(filtered) {
        return filtered.fields[0].value;
      }
    }
  }

  public getDessert(event) {
    if(event.moreDetails) {
      const filtered = event.moreDetails.find(t=>t.code === "79004");
      if(filtered) {
        return Number(filtered.fields[0].value) / 4;
      }
      else {
        return 0;
      }
    }
  }

    ngOnDestroy(): void {
        this.clearSubscriptions();
    }

}
