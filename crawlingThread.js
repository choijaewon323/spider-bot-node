const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const Route = require("./classes/Route.js");

/*
    return : Route[]
*/
module.exports = async function crawl(value) {
    const browser = await puppeteer.launch({
        timeout: 0,
        headless: 'new'
    });

    const page = await browser.newPage();

    await page.viewport({
        width: 800,
        height: 600
    });

    let departure = value[0];
    let destination = value[1];
    let departureDate = value[2];
    const URL = `https://m-flight.naver.com/flights/international/${departure}-${destination}-${departureDate}?adult=1&isDirect=true&fareType=Y`;

    await page.goto(URL);

    await page.waitForSelector('#__next > div > div.container > div.international_content__2Z9HD > div > div.header_InternationalHeader__16F2u > div');

    const list = await page.$$('.indivisual_IndivisualItem__3co62');
    let result = [];

    for (let element of list) {
        const airlineTag = await element.$(".airline > .name");
        const airline = await airlineTag.evaluate(el => el.textContent);
        const times = await element.$$(".route_time__-2Z1T");
        const startTime = await times[0].evaluate(el => el.textContent);
        const endTime = await times[1].evaluate(el => el.textContent);
        const dateTag = await element.$(".route_info__1RhUH");
        const date = await dateTag.evaluate(el => el.textContent);
        const priceTag = await element.$('.item_num__3R0Vz')
        const price = await priceTag.evaluate(el => el.textContent);

        result.push(new Route(airline, departure, destination, startTime, endTime, date, price));
    }

    await browser.close();

    return result;
}