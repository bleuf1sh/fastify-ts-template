import { PuppeteerUtils } from './puppeteer-utils';
import { UtilityBelt } from '../utility-belt/utility-belt';
import { Browser, Page } from "puppeteer";


describe("PuppeteerUtils", () => {

  const uBelt = new UtilityBelt('TEST|PuppeteerUtils');
  const puppeteer = PuppeteerUtils.getPuppeteer();
  let browser: Browser;
  let page: Page;

  beforeEach(async () => {
    browser = await puppeteer.launch(PuppeteerUtils.LAUNCH_CONFIG);
    page = await PuppeteerUtils.PageUtils.getPage(browser);
  });

  afterEach(async () => {
    return browser.close();
  });


  it("should perform page level lookups and operations", async () => {
    await PuppeteerUtils.PageUtils.goTo(page, `https://en.wikipedia.org/wiki/List_of_prime_ministers_of_Israel`);
    const els = await PuppeteerUtils.ElementHandleUtils.getAllElementsWithText(page, 'a', 'Netanyahu');
    for (const el of els) {
      uBelt.logDebug(`${await PuppeteerUtils.ElementHandleUtils.getOuterHtml(el)}`);
    }
    expect(els).toBeTruthy();
    expect(els.length).toEqual(6);

    const goldaEls = await PuppeteerUtils.ElementHandleUtils.getAllElementsWithText(page, 'a', 'Golda Meir');
    expect(goldaEls.length).toBeGreaterThan(0);

    expect(await PuppeteerUtils.ElementHandleUtils.getHref(goldaEls[0])).toContain(`https://en.wikipedia.org/wiki/Golda_Meir`);

    await PuppeteerUtils.HumanUtils.scrollUntilVisible(page, goldaEls[0]);
    await PuppeteerUtils.HumanUtils.click(page, goldaEls[0]);
    await page.waitForNavigation();
    await PuppeteerUtils.PageUtils.waitForTextOnPage(page, 'who served as the fourth prime minister of Israel');
  }, 20000);



});