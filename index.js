const cheerio = require('cheerio')
const axios = require('axios').default

const prices = {
    davidJones: undefined,
    babyBunting: undefined,
};

const davidJonesURL = 'https://www.davidjones.com/Product/22339110/Bugaboo-Cameleon3plus-base-AU-BLACKGREY-MELANGE';
const davidJones = axios.get(davidJonesURL)
    .then((response) => {
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const price = $('.price-display').text();
            return price
        }
    }, (error) => console.log(error));

const babyBuntingURL = 'https://www.babybunting.com.au/bugaboo-cameleon3plus-classic-complete-black-grey-melange.html';
const babyBunting = axios.get(babyBuntingURL)
    .then((response) => {
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const price = $('.regular-price .price').first().text()
            return price
        }
    }, (error) => console.log(error));

Promise.all([davidJones, babyBunting]).then((values) => {
    prices.davidJones = values[0];
    prices.babyBunting = values[1];
    console.log(prices);
}).catch((reason) => {
    console.log('dang, it failed')
    console.log(reason)
})