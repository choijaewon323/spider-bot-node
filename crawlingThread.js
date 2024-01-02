const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const Route = require("./classes/Route.js");

module.exports = {crawl};

async function crawl(value) {
    const browser = await puppeteer.launch({
        timeout: 0,
        headless: false
    });

    const page = await browser.newPage();

    await page.viewport({
        width: 800,
        height: 600
    });

    let departure = value[0];       // String
    let destination = value[1];     // String
    let departureDate = value[2];   // Date

    let d = new Date();
    d.getUTCMonth()

    let year = departureDate.getUTCFullYear().toString();
    let month = (departureDate.getUTCMonth() + 1).toString();
    let day = departureDate.getUTCDate().toString();

    if (month.length == 1) {
        month = "0" + month;
    }
    if (day.length == 1) {
        day = "0" + day;
    }

    let searchDate = year + month + day;

    const url = `https://m-flight.naver.com/flights/international/${departure}-${destination}-${searchDate}?adult=1&isDirect=true&fareType=Y`;

    await page.goto(url);

    await page.waitForSelector('.header_InternationalHeader__16F2u');

    await page.waitForFunction(() => !document.querySelector(".loadingProgress_loadingProgress__1LRJo"));

    const list = await page.$$('.indivisual_IndivisualItem__3co62.result');
    let result = [];

    const listLength = list.length;

    for (let idx = 0; idx < listLength; idx++) {
        const tempList = await page.$$('.indivisual_IndivisualItem__3co62.result');
        await page.waitForSelector('.indivisual_IndivisualItem__3co62.result');
        const element = tempList[idx];


        const airlineTag = await element.$(".airline_Airlines__8QpMj");
        const airline = await airlineTag.evaluate(el => el.textContent);
        const times = await element.$$(".route_time__-2Z1T");
        let startTime = await times[0].evaluate(el => el.textContent);
        let endTime = await times[1].evaluate(el => el.textContent);
        const dateTag = await element.$(".route_info__1RhUH");
        const date = await dateTag.evaluate(el => el.textContent);
        const priceTag = await element.$('.item_num__3R0Vz')
        const price = await priceTag.evaluate(el => el.textContent);
        
        const nextDayTag = await element.$(".route_extra__xjOtx");
        
        const startTimes = startTime.split(':');
        const endTimes = endTime.split(':');

        let fullStartDate = new Date(Date.UTC(
            departureDate.getUTCFullYear(), departureDate.getUTCMonth(), departureDate.getUTCDate(), 
            Number(startTimes[0]), Number(startTimes[1]), 0
        ));
        
        let fullEndDate = new Date(Date.UTC(
            departureDate.getUTCFullYear(), departureDate.getUTCMonth(), departureDate.getUTCDate(), 
            Number(endTimes[0]), Number(endTimes[1]), 0
        ));

        if (nextDayTag != null) {
            fullEndDate.setUTCDate(fullEndDate.getUTCDate() + 1);
        }

        // get flightNumber
        
        let elementButton = await element.$('.indivisual_select_schedule__h2pp1');
        await elementButton.evaluate(e => e.scrollIntoView({behavior: 'auto',
        block: 'center',
        inline: 'center'}));
        await elementButton.evaluate(b => b.click());
        let detailed = await element.$$('.item_anchor__2CGzx');
        if (detailed.length > 0) {
            await detailed[0].evaluate(e => e.scrollIntoView({behavior: 'auto',
            block: 'center',
            inline: 'center'}));
            await detailed[0].evaluate(b => b.click());
        }

        let link = await page.url();

        const tempURL = new URL(link);

        let flightNumberStr = tempURL.searchParams.get('selectedFlight');
        let strs = flightNumberStr.split(':');
        let flightNumber = strs[1].substring(14);

        //airline, departure, destination, fullStartDate, fullEndDate, totalTime, price, flightNumber, isSoldOut
        result.push(new Route(airline, departure, destination, fullStartDate, fullEndDate, date, parseInt(price.split(',').join("")), flightNumber, false, link));
        
        const closeButton = await page.$('.detailSchedule_delete__2G2TT');
        await closeButton.evaluate(e => e.scrollIntoView({behavior: 'auto',
        block: 'center',
        inline: 'center'}));
        await closeButton.evaluate(b => b.click());
    }

    await page.close();
    await browser.close();

    return result;
}

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    })
}

/*

async function koreanAirCrawl(value) {
    const browser = await puppeteer.launch({
        timeout: 0,
        headless: false
    });

    //console.log("crawl entered");

    let page = await browser.newPage();

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

    const URL = `https://www.koreanair.com/booking/search?hl=ko`;

    await page.goto(URL);

    try {
        await initial(page, departure, destination, year, month, day);

        let result = await download(page, departure, destination, year, month, day);
        await browser.close();
        return result;
    }
    catch (error) {
        await browser.close();
        return [];
    }
}

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    })
}

async function initial(page, departure, destination, year, month, day) {
    let pyeondo = await page.waitForXPath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-booking-type-cont/ke-booking-type-pres/div/div/div/div[2]/div/label');
    await pyeondo.click();

    await page.click('.booking-new__code');
    let input = await page.$x('/html/body/ke-dynamic-modal/div/ke-airport-layer/div/div/div/div/ke-airport-chooser/div/div[1]/input');
    await input[0].type(departure);
    await page.keyboard.press('Enter');

    let destinationButton = await page.$x('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/div/div[1]/div/div/div[1]/ke-airport-selector/div/button[2]/span[1]');
    await destinationButton[0].click();
    input = await page.$x('/html/body/ke-dynamic-modal/div/ke-airport-layer/div/div/div/div/ke-airport-chooser/div/div[1]/input');
    await input[0].type(destination);
    await page.keyboard.press('Enter');

    let seatClassButton = await page.$x('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/div/div[2]/div[2]/div/button');
    await seatClassButton[0].click();

    let ilban = await page.$x('/html/body/ke-dynamic-modal/div/ke-upgrade-seat-modal/div/div/div/div[1]/div[1]/div[1]/label');
    await ilban[0].click();
    let ilbanComfirm = await page.$x('/html/body/ke-dynamic-modal/div/ke-upgrade-seat-modal/div/div/div/div[2]/button');
    await ilbanComfirm[0].click();

    let datePicker = await page.$x('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/div/div[1]/div/div/div[2]/div[1]/button');
    await datePicker[0].click();

    let dateId = "month" + year + month;
    let monthAndYear = await page.$('#' + dateId);
    await page.evaluate((monthAndYear) => {
        monthAndYear.scrollIntoView();
    }, monthAndYear);

    let days = await monthAndYear.$$('.ng-tns-c27-1');

    for (let tempDay of days) {
        let dayString = await tempDay.evaluate(el => el.textContent);

        if (dayString == day) {
            await tempDay.click();
            break;
        }
    }

    let dateConfirm = await page.$x('/html/body/ke-dynamic-modal/div/ke-calendar/div/div/div/div[2]/div/div/div[3]/button');
    await dateConfirm[0].click();

    let allConfirm = await page.$('#bookingGateOnSearch');
    await allConfirm.click();
}

async function download(page, departure, destination, year, month, day) {

    if (day.length == 1) {
        day = "0" + day;
    }

    let start = await page.waitForXPath('/html/body/app-root/div/ke-select-flight-revenue-cont/ke-select-flight-revenue-pres/ke-basic-layout/div[1]/div/div/ke-select-flight-revenue-international-cont/ke-select-flight-revenue-international-pres/div/div/div[1]/ul/li[1]/button');

    let filter = await page.$x('/html/body/app-root/div/ke-select-flight-revenue-cont/ke-select-flight-revenue-pres/ke-basic-layout/div[1]/div/div/ke-select-flight-revenue-international-cont/ke-select-flight-revenue-international-pres/div/div/div[2]/ke-revenue-flight-filter/div/div[1]/button');
    await page.evaluate((filter) => {
        filter.scrollIntoView();
    }, filter[0]);
    await filter[0].click();

    let direct = await page.waitForXPath('/html/body/ke-dynamic-modal/div/div/div[2]/div/div/div[1]/div[2]/div/div[2]/input');
    await delay(1000);
    let disabled = await page.evaluate(direct => direct.disabled, direct);

    if (disabled) {
        return [];
    }

    await direct.click();
    let directConfirm = await page.$x('/html/body/ke-dynamic-modal/div/div/div[2]/div/div/div[2]/div/button');
    await directConfirm[0].evaluate(el => el.scrollIntoView());
    await directConfirm[0].click();

    let routes = await page.$$('.flight-n__item.ng-star-inserted');
    let result = [];

    for (let route of routes) {
        let times = await route.$$('.flight-n__time');
        let filghtNumberTag = await route.$('.flight-n__number');
        let totalTimeTag = await route.$('.flight-n__duration.ng-star-inserted');
        let priceTag = await route.$('.flight-n__price-num');
        let overtime = await route.$('.flight-n__overtime.ng-star-inserted');
        
        let startTime = await times[0].evaluate(el => el.textContent);
        startTime = startTime.trim();
        let endTime = await times[1].evaluate(el => el.textContent);
        endTime = endTime.trim();
        let flightNumberStr = await filghtNumberTag.evaluate(el => el.textContent);
        flightNumberStr = flightNumberStr.trim();
        let totalTime = await totalTimeTag.evaluate(el => el.textContent);
        totalTime = totalTime.trim();
        let priceStr;

        let fullStartDate = new Date(`${year}-${month}-${day}T${startTime}:00`);
        let fullEndDate = new Date(`${year}-${month}-${day}T${endTime}:00`);

        if (overtime != null) {
            fullEndDate = new Date(fullEndDate.setDate(fullEndDate.getDate() + 1));
        }

        let isSoldOut;
        let price;
        if (priceTag == null) {
            price = -1;
            isSoldOut = true;
        }
        else {
            priceStr = await priceTag.evaluate(el => el.textContent);
            priceStr = priceStr.trim();
            price = parseInt(priceStr.split(',').join(""));
            isSoldOut = false;
        }

        let strings = flightNumberStr.split(" ");
        let flightNumber = strings[0];
        
        let airline;
        if (strings.length >= 2) {
            airline = strings[2];
        }
        else {
            airline = "대한항공";
        }

        result.push(new Route(airline, departure, destination, fullStartDate, fullEndDate, totalTime, price, flightNumber, isSoldOut));
    }
    return result;
}
*/