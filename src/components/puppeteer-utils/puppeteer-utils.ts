import { Page, ElementHandle, Browser, BoundingBox } from "puppeteer";
import { UtilityBelt } from "../utility-belt/utility-belt";
import fs from 'fs-extra';
import path from "path";
declare const navigator: Navigator | any;

class _PuppeteerUtils {
  private readonly uBelt = new UtilityBelt('PuppeteerUtils');
  // private readonly puppeteerType = 'puppeteer-core';
  // private readonly puppeteer = require(this.puppeteerType);

  public getDownloadPath() {
    const dlPath = path.resolve(`${this.LAUNCH_CONFIG.userDataDir}/Downloads`);
    if (!fs.existsSync(dlPath)) {
      fs.mkdirSync(dlPath, { recursive: true });
    }
    return dlPath;
  }

  public getDownloadPathFileList() {
    const dlPath = path.resolve(`${this.LAUNCH_CONFIG.userDataDir}/Downloads`);
    return fs.readdirSync(dlPath);
  }

  public clearDownloadDir() {
    fs.emptyDirSync(this.getDownloadPath());
  }

  public async downloadFile(page: Page, dlUrl: string) {
    const beforeDlFileList = PuppeteerUtils.getDownloadPathFileList();
    await PuppeteerUtils.PageUtils.goToAlt(page, dlUrl);
    await UtilityBelt.waitUntil(() => {
      const currentDlFileList = PuppeteerUtils.getDownloadPathFileList();
      this.uBelt.logDebug(`Waiting for download to finish...`);
      return currentDlFileList.length > beforeDlFileList.length;
    }, 30_000, 2_000);
  }

  public getScreenshotPath(filename: string): string {
    return `odd/${filename}.png`
  }
  public readonly LAUNCH_CONFIG = {
    // slowMo: 300,
    headless: UtilityBelt.isRepeater(),
    devtools: false,
    executablePath: UtilityBelt.isMacOs() ? `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` : undefined,
    userDataDir: `${UtilityBelt.isTesting() ? 'envTest' : 'envProd'}/StablePuppeteerUserDataDir/`,

    // executablePath: `/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary`,
    // userDataDir: `${UtilityBelt.isTesting() ? 'envTest' : 'envProd'}/CanaryPuppeteerUserDataDir/`,
  };
  public getPuppeteer() {
    const puppeteer = require('puppeteer-extra');
    puppeteer.use(require('puppeteer-extra-plugin-stealth')());
    puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());

    const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');

    const userPreferenceOptions = {
      userPrefs: {
        plugins: {
          always_open_pdf_externally: true,
        },
        download: {
          open_pdf_in_system_reader: false,
          prompt_for_download: false,
          default_directory: this.getDownloadPath(),
          // this arg handle multiple download popup
          automatic_downloads: 1,
        },
        profile: {
          default_content_setting_values: {
            automatic_downloads: 1,
          },
        },
      }
    };
    puppeteer.use(UserPreferencesPlugin(userPreferenceOptions));

    return puppeteer;
  }

  public readonly HumanUtils = new _HumanUtils();
  public readonly ElementHandleUtils = new _ElementHandleUtils();
  public readonly PageUtils = new _PageUtils();
}

/** Inspired from https://github.com/das-th-koeln/HOSIT/blob/master/include/functions.js */
class _HumanUtils {

  public async scrollWholePage(page: Page) {
    try {
      const height = Math.ceil(1.0 * Number(await page.evaluate('window.innerHeight')));
      let distanceScrolledSoFar = 0;
      while (distanceScrolledSoFar <= height) {
        let randomScrollAmount = UtilityBelt.getRandomFromDeviation(60, 30);
        distanceScrolledSoFar += randomScrollAmount;
        await page.evaluate(`window.scrollBy(0, ${randomScrollAmount})`);
        await this.randomWait(page, 350, 80);
      }
    } catch (e) { }
  }

  public async scrollHalfPage(page: Page) {
    try {
      const halfHeight = Math.ceil(0.5 * Number(await page.evaluate('window.innerHeight')));
      let distanceScrolledSoFar = 0;
      while (distanceScrolledSoFar <= halfHeight) {
        let randomScrollAmount = UtilityBelt.getRandomFromDeviation(60, 30);
        distanceScrolledSoFar += randomScrollAmount;
        await page.evaluate(`window.scrollBy(0, ${randomScrollAmount})`);
        await this.randomWait(page, 350, 80);
      }
    } catch (e) { }
  }

  public async type(page: Page, text: string, enterOnEnd: boolean = false) {
    for (let char of text) {
      page.keyboard.type(char, { delay: UtilityBelt.getRandomFromDeviation(225, 115) });
      await this.randomWait(page, 200, 100);
    }

    if (enterOnEnd) {
      await page.keyboard.down('Enter');
      await this.randomWait(page, 20, 12);
      await page.keyboard.press('Enter');
      await this.randomWait(page, 20, 12);
      await page.keyboard.up('Enter');
    }
  }

  public async scrollUntilVisible(page: Page, element: ElementHandle) {
    const startMs = Date.now();
    while (Date.now() - startMs <= 10_000) {
      if (await element.isIntersectingViewport()) {
        return;
      } else {
        await this.scrollHalfPage(page);
      }
    }
  }

  public async click(page: Page, element: ElementHandle, tap = false, boundingBox = undefined) {
    try {
      // Set delay time
      let params = {
        delay: UtilityBelt.getRandomFromDeviation(160, 20)
      };

      // Get bounding box of element
      if (!boundingBox) {
        boundingBox = await element.boundingBox();
      }




      let width = boundingBox.width;
      let height = boundingBox.height;
      let halfWidth = width / 2;
      let halfHeight = height / 2;

      // Default to center of element
      let x = boundingBox.x + halfWidth;
      let y = boundingBox.y + halfHeight;

      if (width > 16 && height > 16) {
        // Calculate random click position inside the allowed clicking
        // area of the element (1/4 around the element center).
        x = boundingBox.x + UtilityBelt.getRandomNumberBetween(halfWidth - width / 8, halfWidth + width / 8);
        y = boundingBox.y + UtilityBelt.getRandomNumberBetween(halfHeight - height / 8, halfHeight + height / 8);
      }

      if (tap) {
        await page.touchscreen.tap(x, y);
      } else {
        await page.mouse.click(x, y, params);
      }
    } catch (e) {
      await element.click();
    }
  }

  public async randomWait(page: Page, baseTimeMs = 2000, deviationMs = 1000) {
    let randomTime = UtilityBelt.getRandomFromDeviation(baseTimeMs, deviationMs);
    await page.waitForTimeout(randomTime);
  }
}

class _ElementHandleUtils {

  private readonly uBelt = new UtilityBelt('ElementHandleUtils');

  public async getAllElementsWithText(element: Page | ElementHandle, selector: string, text: string = '') {
    text = text.toLowerCase();
    this.uBelt.logDebug(`getAllElementsWithText() ${selector} - ${text}`);
    const allElements = await element.$$(selector);
    const matchedElements: ElementHandle[] = [];
    for (const el of allElements) {
      const elText = await this.getTextContent(el);
      // this.uBelt.logDebug(`getAllElementsWithText() selector found "${elText}"`);
      if (elText.toLowerCase().includes(text)) { matchedElements.push(el); }
    }
    this.uBelt.logDebug(`getAllElementsWithText() ${selector} - ${text} ... found ${matchedElements.length} matches`);
    return matchedElements;
  }

  public async getAllElementsWithHtml(element: Page | ElementHandle, selector: string, html: string = '') {
    html = html.toLowerCase();
    this.uBelt.logDebug(`getAllElementsWithHtml() ${selector} - ${html}`);
    const allElements = await element.$$(selector);
    const matchedElements: ElementHandle[] = [];
    for (const el of allElements) {
      const elText = await this.getOuterHtml(el);
      if (elText.toLowerCase().includes(html)) { matchedElements.push(el); }
    }
    this.uBelt.logDebug(`getAllElementsWithHtml() ${selector} - ${html} ... found ${matchedElements.length} matches`);
    return matchedElements;
  }

  public async getHref(elHandle: ElementHandle<Element>): Promise<string> {
    if (!elHandle) return null;

    // return this.getAttribute(elHandle, 'href');
    return elHandle.evaluate((domElement) => {
      //@ts-ignore
      return domElement.href;
    });
  }

  public async getTextContent(elHandle: ElementHandle<Element>) {
    if (!elHandle) return '';

    const propHandle = await elHandle.getProperty('textContent');
    const textContent = await propHandle.jsonValue();
    return `${textContent}`;
  }

  public async getProperty(elHandle: ElementHandle<Element>, propertyName: string) {
    if (!elHandle) return null;

    const propHandle = await elHandle.getProperty(propertyName);
    const property = await propHandle.jsonValue();
    return `${property}`;
  }

  public async getAttribute(elHandle: ElementHandle<Element>, attributeName: string) {
    if (!elHandle) return null;

    const [hrefHandle] = await elHandle.$x(`.//@${attributeName}`);
    const propertyHandle = await hrefHandle.getProperty('value');
    const propertyValue = await propertyHandle.jsonValue();
    return `${propertyValue}`;
  }

  public async getOuterHtml(elHandle: ElementHandle<Element>) {
    const element_property = await elHandle.getProperty('outerHTML');
    const html = await element_property.jsonValue();
    return `${html}`;
  }

}

class _PageUtils {

  public async goToAlt(page: Page, url: string) {
    // https://github.com/puppeteer/puppeteer/issues/6728#issuecomment-986082241
    return page.evaluate((url) => {
      location.href = url;
    }, url);
  }

  /** text can't have a " in it */
  public async waitForTextOnPage(page: Page, text: string) {
    return await page.waitForFunction(
      `document.querySelector("body").innerText.toLowerCase().includes("${text.toLowerCase()}")`,
      // { polling: 0, timeout: 0 }
    );
  }

  /** selector can't have a " in it */
  public async waitForElementVisibility(page: Page, elementSelector: string, waitToBeVisible: boolean) {
    return await page.waitForFunction(
      `document.querySelector("${elementSelector}").checkVisibility()==${waitToBeVisible}`,
      // { polling: 0, timeout: 0 }
    );
  }

  public async getBoundingBox(page: Page, selector: string, textToContain = ''): Promise<BoundingBox> {
    const boundingBoxJsonStr: string = await page.evaluate((selector, textToContain) => {
      let bBox: BoundingBox;
      const elList = document.querySelectorAll(selector);
      for (const el of elList) {
        if (el.textContent.toLowerCase().includes(textToContain)) {
          bBox = el.getBoundingClientRect();
          break;
        }
      }
      return JSON.stringify(bBox);
    }, selector, textToContain);

    return JSON.parse(boundingBoxJsonStr);
  }

  public async getPage(browser: Browser, deviceName?: string, enableCamo: boolean = true): Promise<Page> {
    // const emulatedLaptop = {
    //   name: 'Laptop 1280x800',
    //   // https://techblog.willshouse.com/2012/01/03/most-common-user-agents/
    //   userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36`,
    //   viewport: {
    //     width: 1280,
    //     height: 800
    //   }
    // };
    const page: Page = await browser.newPage();
    this.applyPageHooks(page);
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: PuppeteerUtils.getDownloadPath(),
    });

    // if (deviceName) {
    //   const device = PuppeteerUtils.getPuppeteer().devices[deviceName];
    //   await page.emulate(device);
    // } else {
    //   await page.emulate(emulatedLaptop);
    // }

    // await PageUtils.enableImageBlocking(page);
    // if (enableCamo) {
    //   await this._enableCamouflage(page);
    // }
    return page;
  }

  public async goTo(page: Page, url: string) {
    return page.goto(url, { waitUntil: 'networkidle2' });
  }

  public async scrollPageXTimes(page: Page, scrollCount: number, scrollDelay = 1000) {
    try {
      let attemptedScrollCount = 0;
      let previousHeight: number;
      while (attemptedScrollCount <= scrollCount) {
        attemptedScrollCount += 1;
        previousHeight = Number(await page.evaluate('document.body.scrollHeight'));
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitForTimeout(scrollDelay);
      }
    } catch (e) { }
  }



  public async enableImageBlocking(page: Page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  public async enableImageFaking(page: Page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  // /**
  //  * Enables additional protection mechanisms for the given page to reduce
  //  * possibilities for services to identify the headless browser
  //  */
  // private async _enableCamouflage(page: Page) {
  //   let camouflage = () => {
  //     // Remove webdriver object from navigator
  //     const navigatorNew = navigator.__proto__;
  //     delete navigatorNew.webdriver;
  //     navigator.__proto__ = navigatorNew;
  //   };

  //   // Do camouflage on this page right now
  //   await page.evaluate(camouflage);

  //   // Enable camouflage for each now page
  //   await page.evaluateOnNewDocument(camouflage);
  // }

  public applyPageHooks(page: Page) {
    // Emitted when the DOM is parsed and ready (without waiting for resources)
    page.once('domcontentloaded', () => console.info('✅ DOM is ready'));

    // Emitted when the page is fully loaded
    page.once('load', () => console.info('✅ Page is loaded'));

    // // Emitted when the page attaches a frame
    // page.on('frameattached', () => console.info('✅ Frame is attached'));

    // // Emitted when a frame within the page is navigated to a new URL
    // page.on('framenavigated', () => console.info('👉 Frame is navigated'));

    // // Emitted when a script within the page uses `console.timeStamp`
    // page.on('metrics', data => console.info(`👉 Timestamp added at ${data.metrics.Timestamp}`));

    // Emitted when a script within the page uses `console`
    if (UtilityBelt.isTesting()) {
      page.on('console', message => console.log(`👉 PAGE: ${message.text()}`));
    }

    if (!UtilityBelt.isTesting()) {
      // Emitted when the page emits an error event (for example, the page crashes)
      page.on('error', error => console.error(`❌ ${error}`));

      // Emitted when a script within the page has uncaught exception
      page.on('pageerror', error => console.error(`❌ ${error}`));
    }


    // Emitted when a script within the page uses `alert`, `prompt`, `confirm` or `beforeunload`
    // page.on('dialog', async dialog => {
    //   console.info(`👉 ${dialog.message()}`);
    //   await dialog.dismiss();
    // });

    // Emitted when a new page, that belongs to the browser context, is opened
    page.on('popup', () => console.info('👉 New page is opened'));

    // // Emitted when the page produces a request
    // page.on('request', request => console.info(`👉 Request: ${request.url()}`));

    // // Emitted when a request, which is produced by the page, fails
    // page.on('requestfailed', request => console.info(`❌ Failed request: ${request.url()}`));

    // // Emitted when a request, which is produced by the page, finishes successfully
    // page.on('requestfinished', request => console.info(`👉 Finished request: ${request.url()}`));

    // // Emitted when a response is received
    // page.on('response', response => console.info(`👉 Response: ${response.url()}`));

    // // Emitted when the page creates a dedicated WebWorker
    // page.on('workercreated', worker => console.info(`👉 Worker: ${worker.url()}`));

    // // Emitted when the page destroys a dedicated WebWorker
    // page.on('workerdestroyed', worker => console.info(`👉 Destroyed worker: ${worker.url()}`));

    // // Emitted when the page detaches a frame
    // page.on('framedetached', () => console.info('✅ Frame is detached'));

    // Emitted after the page is closed
    page.once('close', () => console.info('✅ Page is closed'));
  }

}


export const PuppeteerUtils = new _PuppeteerUtils();




// Pattern to wait until the page you opened came from a specific action
// const origPageTarget = page.target();
// await link.tap();
// //check that the first page opened this new page:
// const newPageTarget = await browser.waitForTarget(target => target.opener() === origPageTarget);
// //get the new page object:
// const newPage = await newPageTarget.page();
// await newPage.close();