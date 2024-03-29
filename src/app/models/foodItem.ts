export class FoodItem {
    public Id: string;
    public Code: string;
    public Description: string;
    public Quantity: number;
    public IsAdded: boolean;
    public Image: any;
    public moreDetails: any;

    /**
     *
     */
    constructor() {
        this.Quantity = 0;
        this.IsAdded = false;
        this.Image = '';
    }

    public fromServer(other: any): void {
        this.Id = other.id;
        this.Code = other.product_code;
        this.Description = other.trade_item_description;
        this.Image = other.imgBase64;
        this.moreDetails = other.moreDetails;
        this.IsAdded = false;
    }
}
