import axios from "axios";
export class AppService {
    async getAssets() {
        const options = {
            method: 'GET',
            url: 'https://api.energiswap.exchange/v1/assets',
        };
        const response = await axios.request(options)
        const assets = response.data
        const assetsA = Object.values(assets)
        console.log(assetsA);
        return assetsA
    }

    async getPrice() {
        const options = {
            method: 'GET',
            url: 'https://api.coingecko.com/api/v3/coins/energi',
        };
        const response = await axios.request(options)
        const price = response.data.market_data.current_price.usd
        console.log(price);
        return price
    }

}