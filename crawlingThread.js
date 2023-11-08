const { parentPort } = require('worker_threads');
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const Route = require("./classes/Route.js");

/*
    return : Route[]
*/
module.exports = async function crawl(value) {
    const browser = await puppeteer.launch({
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

    console.log("###### ENTER THE PAGE ######");

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

/*
module.exports = async function crawl(value) {
    let chromeOptions = new chrome.Options().windowSize({width: 800, height: 600})
    
    //.addArguments("--headless")
    //.addArguments("--disable-gpu")
    //.addArguments(['user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"'])

    let driver = await new Builder()
        .forBrowser('chrome')
        //.setChromeOptions(new chrome.Options())
        .setChromeOptions(chromeOptions)
        .build();

    const URL = "https://www.koreanair.com/booking/search?hl=ko";
    const departure = value[0];
    const destination = value[1];
    const departureDate = "20231221";
    
    await beforeSearch(URL, driver, departure, destination, departureDate);

    let texts = await search(driver);

    await driver.close();
    
    return texts;
}
*/

/*
async function beforeSearch(URL, driver, departure, destination, departureDate) {
    await driver.get(URL);

    let userAgent = await driver.executeScript("return navigator.userAgent;")
    console.log('UserAgent : ', userAgent);

    await driver.wait(until.elementLocated(By.xpath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-booking-type-cont/ke-booking-type-pres/div/div/div/div[2]/div/label')), 20000);

    // pyeondo
    let pyeondo = await driver.findElement(By.xpath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-booking-type-cont/ke-booking-type-pres/div/div/div/div[2]/div/label'));
    await pyeondo.click();


    // seatClass
    let seatClass = await driver.findElement(By.xpath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/div/div[2]/div[2]/div/button'))
    await seatClass.click();

    let ilban = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/ke-upgrade-seat-modal/div/div/div/div[1]/div[1]/div[1]/label'));
    await ilban.click();

    let ilbanConfirm = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/ke-upgrade-seat-modal/div/div/div/div[2]/button'));
    await ilbanConfirm.click();

    // departure
    let departureButton = await driver.findElement(By.xpath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/div/div[1]/div/div/div[1]/ke-airport-selector/div/button[1]'));
    await departureButton.click();

    let departureInput = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/ke-airport-layer/div/div/div/div/ke-airport-chooser/div/div[1]/input'));
    await departureInput.sendKeys(departure, Key.ENTER);

    // destination
    let destinationButton = await driver.findElement(By.xpath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/div/div[1]/div/div/div[1]/ke-airport-selector/div/button[2]'));
    await destinationButton.click();

    let destinationInput = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/ke-airport-layer/div/div/div/div/ke-airport-chooser/div/div[1]/input'));
    await destinationInput.sendKeys(destination, Key.ENTER);

    // date
    let dateButton = await driver.findElement(By.xpath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/div/div[1]/div/div/div[2]/div[1]/button'));
    await dateButton.click();

    let yearAndMonth = departureDate.substring(0, 6);
    let day = departureDate.substring(6);

    if (day[0] == '0') {
        day = day[1];
    }

    let datePicker = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/ke-calendar/div/div/div/div[1]/div[3]'));
    let monthDiv;
    while (true) {
        monthDiv = await datePicker.findElements(By.id("month" + yearAndMonth));

        if (monthDiv.length > 0) {
            break;
        }

        let next2Month = await driver.findElement(By.className('datepicker__next'));

        let disabled = await next2Month.getAttribute('aria-disabled');

        if (disabled == "true") {
            return;
        }

        await next2Month.click();
        continue;
    }

    let table = await monthDiv[0].findElement(By.css('table'));
    let tbody = await table.findElement(By.css('tbody'));
    let trs = await tbody.findElements(By.css('tr'));
    let flag = false;

    for (let id in trs) {
        let tds = await trs[id].findElements(By.css('td'));

        for (let tid in tds) {
            let td = tds[tid];

            let str = await td.getText();
            let temp = str.split('\n', 1);

            if (temp == day) {
                await driver.executeScript("arguments[0].scrollIntoView();", td);
                await td.click();
                flag = true;
                break;
            }
        }

        if (flag) {
            break;
        }
    }

    let dateConfirm = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/ke-calendar/div/div/div/div[2]/div/div/div[3]/button'));
    await dateConfirm.click();

    // search
    let search = await driver.findElement(By.xpath('/html/body/app-root/div/ke-search/ke-basic-layout/div[1]/div/div[1]/div/div[2]/div/ke-search-ow-rt/button'));
    await search.click();
}

async function search(driver) {
    await driver.wait(until.elementLocated(By.xpath('/html/body/app-root/div/ke-select-flight-revenue-cont/ke-select-flight-revenue-pres/ke-basic-layout/div[1]/div/div/ke-select-flight-revenue-international-cont/ke-select-flight-revenue-international-pres/div/div/div[2]/ke-revenue-flight-filter/div/div[2]/ul/li[2]/button')), 20000);

    let filter = await driver.findElement(By.xpath('/html/body/app-root/div/ke-select-flight-revenue-cont/ke-select-flight-revenue-pres/ke-basic-layout/div[1]/div/div/ke-select-flight-revenue-international-cont/ke-select-flight-revenue-international-pres/div/div/div[2]/ke-revenue-flight-filter/div/div[1]/button'));
    await driver.executeScript("arguments[0].scrollIntoView();", filter);
    await filter.click();

    await driver.sleep(1000);
    let direct = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/div/div[2]/div/div/div[1]/div[2]/div/div[2]/label'));
    await direct.click();

    let apply = await driver.findElement(By.xpath('/html/body/ke-dynamic-modal/div/div/div[2]/div/div/div[2]/div/button'));
    await driver.executeScript("arguments[0].scrollIntoView();", apply);
    await apply.click();

    let flightList = await driver.findElements(By.className('flight-n__item ng-star-inserted'));
    
    let cnt = 1;

    let texts = [];
    
    for (let flight of flightList) {
        let str = await flight.getText();
        texts.push(str);
    }

    return texts;
}
*/

/*
parentPort.on('message', async(present) => {
    console.log("###### THREAD OPEN ######");

    let promises = [];

    let path = present[0];  // Array
    let cost = present[1];  // Integer
    let pathLength = path.length;

    for (let i = 0; i < pathLength - 1; i++) {
        let start = path[i];
        let end = path[i + 1];
            
        let pathPromise = new Promise(async (resolve, reject) => {
            let temp = await crawl([start, end]);
            resolve(temp);
        })
            
        promises.push(pathPromise);
    }

    let result = await Promise.all(promises);
    
    parentPort.postMessage(result);
    parentPort.close();
})
*/

/*
parentPort.on('message', async (value) => {
    let chromeOptions = new chrome.Options().windowSize({width: 800, height: 600})
    
    //.addArguments("--headless")
    //.addArguments("--disable-gpu")
    //.addArguments(['user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"'])

    let driver = await new Builder()
        .forBrowser('chrome')
        //.setChromeOptions(new chrome.Options())
        .setChromeOptions(chromeOptions)
        .build();

    const URL = "https://www.koreanair.com/booking/search?hl=ko";
    const departure = value[0];
    const destination = value[1];
    const departureDate = "20231221";
    
    await beforeSearch(URL, driver, departure, destination, departureDate);

    let texts = await search(driver);

    await driver.close();
    
    parentPort.postMessage(texts);
    parentPort.close();
})
*/