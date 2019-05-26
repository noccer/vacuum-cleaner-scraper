const SES = require('aws-sdk').SES;

exports.handler = async (event, context, callback) => {

    const cheerio = require('cheerio')
    const axios = require('axios').default

    const prices = {
        JBHiFi: undefined,
        HarveyNorman: undefined,
        Myer: undefined,
        GoodGuys: undefined,
        // DavidJones: undefined,
    };

    const JBHiFiURL = 'https://www.jbhifi.com.au/home-appliances/all-cleaning/miele/miele-blizzard-cx1-multifloor-bagless-vacuum/506451/';
    const JBHiFi = axios.get(JBHiFiURL)
        .then((response) => {
            if (response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);
                $('p.price span.amount span.currency').remove();
                $('p.price span.amount sup').remove();
                const price = JSON.stringify(JSON.parse($('p.price span.amount').html()));
                return price;
            }
        }, (error) => console.log(error));

    const HarveyNormanURL = 'https://www.harveynorman.com.au/miele-blizzard-cx1-mulit-floor-bagless-vacuum-cleaner.html';
    const HarveyNorman = axios.get(HarveyNormanURL)
        .then((response) => {
            if (response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);
                $('#product-view-price span.price span').remove();
                const price = $('#product-view-price span.price').html();
                return price;
            }
        }, (error) => console.log(error));

    const MyerURL = 'https://www.myer.com.au/p/miele-cx1-blizzard-multifloor-vacuum';
    const Myer = axios.get(MyerURL)
        .then((response) => {
            if (response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);

                const was = $('div.container p[data-automation="product-price-was"] .bfx-price').html();
                const now = $('div.container p[data-automation="product-price-now"] .bfx-price').html();

                const price = {
                    was,
                    now,
                };
                return price;
            }
        }, (error) => console.log(error));

    const GoodGuysURL = 'https://www.thegoodguys.com.au/miele-blizzard-cx1-multi-floor-bagless-vacuum-10502250';
    const GoodGuys = axios.get(GoodGuysURL).then((response) => {
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);

            $('#contentRecommendationWidget .beforecashback i').remove();
            $('#contentRecommendationWidget .beforecashback strong').remove();

            const price = JSON.stringify(JSON.parse($('#contentRecommendationWidget .beforecashback span').html()));
            const note = $('#contentRecommendationWidget .adv-display small').html();

            return {
                price,
                note,
            }
        }
    })

    // It's not SSR so cant use cheerio... will try JSDOM
    // const DavidJonesURL = 'https://www.davidjones.com/blizzard-cx1-multi-floor-21317925';
    // const DavidJones = axios.get(DavidJonesURL)
    //     .then((response) => {
    //         if (response.status === 200) {
    //             const html = response.data;
    //             const $ = cheerio.load(html);

    //             const was = $('div.prices p.price.was span').html();
    //             const now = $('div.prices p.price.now span').html();

    //             const price = {
    //                 was,
    //                 now,
    //             };
    //             return price;
    //         }
    //     }, (error) => console.log(error));


    const scrapers = await Promise.all([
        JBHiFi,
        HarveyNorman,
        Myer,
        GoodGuys,
        // DavidJones
    ]).then((values) => {
        prices.JBHiFi = values[0];
        prices.HarveyNorman = values[1];
        prices.Myer = values[2];
        prices.GoodGuys = values[3];
        // prices.DavidJones = values[4];

        console.log(`Miele CX1 Multifloor ${new Date().toISOString()}`)
        console.log(JSON.stringify(prices, undefined, 4));
        return prices;
    }).catch((reason) => {
        console.log('dang, it failed')
        console.log(reason)
    });

    // return scrapers

    let Source = event.source;
    let ToAddresses = event.toAddresses;
    if (typeof ToAddresses === 'string') {
        ToAddresses = [ToAddresses];
      }

    const Charset = 'UTF-8';
    // needs ses:SendEmail permission
    new SES().sendEmail({
        Destination: {ToAddresses},
        Message: {
            Body: {
                Html: {
                    Charset,
                    Data: `<pre>${scrapers}</pre>`
                }
            },
            Subject: {
                Charset,
                Data: `Price check for Miele CX1 ${new Date().toDateString()}`
            }
        },
        Source,

    }, callback)

}