export class Api {

    public static Calculator = {
        serverApi: 'https://localhost:5000/api',
        Search: 'GetProduc?name=',
        GetByCode: 'GetDetails?productCode=',
        getImageByCode: 'GetImage?productCode=',
        getProductStart: 'product/search?keySearch=',
        // getProductContain: 'GetProducContain?name=',
        GetProducMongoDb: 'GetProducMongoDb?serch='
    };

}
