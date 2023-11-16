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

    //console.log("crawl entered");

    const page = await browser.newPage();

    await page.viewport({
        width: 800,
        height: 600
    });

    let departure = value[0];       // String
    let destination = value[1];     // String
    let departureDate = value[2];   // Date

    let year = departureDate.getFullYear().toString();
    let month = (departureDate.getMonth() + 1).toString();
    let day = departureDate.getDate().toString();

    if (month.length == 1) {
        month = "0" + month;
    }
    if (day.length == 1) {
        day = "0" + day;
    }

    let searchDate = year + month + day;

    const URL = `https://m-flight.naver.com/flights/international/${departure}-${destination}-${searchDate}?adult=1&isDirect=true&fareType=Y`;

    await page.goto(URL);

    //console.log("entered page");

    await page.waitForSelector('#__next > div > div.container > div.international_content__2Z9HD > div > div.header_InternationalHeader__16F2u > div');

    const list = await page.$$('.indivisual_IndivisualItem__3co62');
    let result = [];

    for (let element of list) {
        const airlineTag = await element.$(".airline > .name");
        const airline = await airlineTag.evaluate(el => el.textContent);
        const times = await element.$$(".route_time__-2Z1T");
        let startTime = await times[0].evaluate(el => el.textContent);
        let endTime = await times[1].evaluate(el => el.textContent);
        const dateTag = await element.$(".route_info__1RhUH");
        const date = await dateTag.evaluate(el => el.textContent);
        const priceTag = await element.$('.item_num__3R0Vz')
        const price = await priceTag.evaluate(el => el.textContent);
        
        const nextDayTag = await element.$(".route_extra__xjOtx");
        
        let fullStartDate = new Date(`${year}-${month}-${day}T${startTime}:00`);
        let fullEndDate = new Date(`${year}-${month}-${day}T${endTime}:00`)

        if (nextDayTag != null) {
            fullEndDate = new Date(fullEndDate.setDate(fullEndDate.getDate() + 1));
        }

        result.push(new Route(airline, departure, destination, fullStartDate, fullEndDate, date, parseInt(price.split(',').join(""))));
    }

    await browser.close();

    return result;
}