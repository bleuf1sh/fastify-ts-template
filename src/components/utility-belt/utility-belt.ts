import { EOL } from 'os';
import { Readable } from 'stream'
import { format, intervalToDuration, formatDuration } from 'date-fns'
import shortUUID = require('short-uuid');
const reallyShortUUID = shortUUID('|()*+-.,/:<=>?!@#$%[]^_{}~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
const mongoSafeUUID = shortUUID('|()*+-,/:<=>?!@#%[]^_{}~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
const urlSafeUUID = shortUUID('-_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');


/**
 * General Utilities Class inspired by Batman's utility belt :)
 */
export class UtilityBelt {
  private tag: string;

  constructor(tag: string, tagPadding: number = 13) {
    this.tag = tag.padEnd(tagPadding, ' ').substring(0, tagPadding);
  }

  public static genUUID(): string {
    return reallyShortUUID.generate();
  }

  public static genMongoSafeUUID(): string {
    return mongoSafeUUID.generate();
  }

  public static genUrlSafeUUID(): string {
    return urlSafeUUID.generate();
  }

  public static isDryDb(): boolean {
    return !!process.env['IS_DRY_DB'];
  }

  public static isTesting(): boolean {
    if (process.env.NODE_ENV === 'test') return true;
    else return false;
  }

  public static isMacOs(): boolean {
    return process.platform == "darwin";
  }

  public static isString(data: any): data is string {
    return typeof data === 'string';
  }

  public static nowMs(): number {
    return Date.now();
  }

  public static nowSec(): number {
    return Math.floor(Date.now() / 1000);
  }

  public static async waitUntil(fn, maxWaitTimeMs = 0, pollEveryMs = 1_000) {
    const endMs = Date.now() + maxWaitTimeMs;
    while (!fn()) {
      await new Promise(resolve => setTimeout(resolve, pollEveryMs));
      if (maxWaitTimeMs && Date.now() > endMs) { throw new Error('waitUntil timed out'); }
    }
  }

  public static async waitUntilAsync(fn, maxWaitTimeMs = 0, pollEveryMs = 1_000) {
    const endMs = Date.now() + maxWaitTimeMs;
    while (!(await fn())) {
      await new Promise(resolve => setTimeout(resolve, pollEveryMs));
      if (maxWaitTimeMs && Date.now() > endMs) { throw new Error('waitUntilAsync timed out'); }
    }
  }

  public static async waitMs(timeMs: number) {
    return new Promise(resolve => setTimeout(resolve, timeMs));
  }

  public static replaceAll(text: string, oldStr: string, newStr: string) {
    return text.split(oldStr).join(newStr);
  }

  public static shuffleList(list: any[], modifyOriginal = true) {
    if (!modifyOriginal) list = list.slice(0);
    list.sort(() => Math.random() - 0.5);
    return list;
  }


  public static removeAllUndefined(obj: any) {
    Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : {});
  }


  public static addToArrayIfNotExist<T>(arr: T[], obj: T) {
    if (UtilityBelt.deepIndexOf(arr, obj) < 0) {
      arr.push(obj);
    }
  }

  public static deepIndexOf(arr: any[], obj: any) {
    return arr.findIndex(function (cur) {
      return Object.keys(obj).every(function (key) {
        return obj[key] === cur[key];
      });
    });
  }

  public static getRandomFromDeviation(base: number, deviation: number) {
    return UtilityBelt.getRandomNumberBetween(base - deviation, base + deviation);
  }

  public static getRandomNumberBetween(minInclusive: number, maxInclusive: number) {
    return Math.floor(Math.random() * (maxInclusive - minInclusive + 1) + minInclusive);
  }


  public static isRepeater() {
    return !!process.env[`IS_REPEATER`];
  }


  public static getHumanDate(): string {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS')
  }

  public static getPrettyDuration(startMs: number, endMs: number) {
    const interval: Interval = { start: startMs, end: endMs };
    const durations = intervalToDuration(interval);
    return formatDuration(durations)
      .split(' hour').join('h ')
      .split(' minute').join('m ')
      .split(' second').join('s ')
      .split(' s').join(' ')
      .split('  ').join(' ').trim();
  }

  public static getPrettyUptime(): string {
    return UtilityBelt.getPrettyDuration(0, process.uptime() * 1000);
  }

  public static pretty(obj: any, spaces = 2, injectNewLine = true): string {
    if (!injectNewLine) return JSON.stringify(obj, null, spaces);
    else return `${EOL}${JSON.stringify(obj, null, spaces)}`;
  }

  logError(text: string) {
    if (process.env.HIDE_ERRR_LOGS) {
      return;
    }
    this.log(`!!!!!!!!!!!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!!!!!!!!!!`);
    this.log(`ERRR|${this.tag}| ${text}${EOL}!!!!!!!!!!!!!!!!!!!!!!!!!!`);
  }

  logWarning(text: string) {
    if (process.env.HIDE_WARN_LOGS) {
      return;
    }
    this.log(`------------------------ WARNING ------------------------`);
    this.log(`WARN|${this.tag}| ${text}${EOL}------------------------`);
  }

  logInfo(text: string) {
    if (process.env.HIDE_INFO_LOGS) {
      return;
    }
    this.log(`INFO|${this.tag}| ${text}`);
  }

  logDebug(text: string) {
    if (process.env.HIDE_DBUG_LOGS) {
      return;
    }
    this.log(`DBUG|${this.tag}| ${text}`);
  }

  private log(text: string) {
    console.log(`${UtilityBelt.getHumanDate()}|${text}`)
  }
}


export class KeywordFinder {
  private regexKeywordList: string[];
  private keywordFindingRegex: RegExp;

  constructor(regexKeywordList: string[]) {
    this.regexKeywordList = regexKeywordList;
    this.keywordFindingRegex = this.generateKeywordFindingRegex(regexKeywordList);
  }

  getRegexKeywordList(): string[] {
    return this.regexKeywordList;
  }

  isKeywordPresent(text: string) {
    if (!text) return false;

    return this.keywordFindingRegex.test(text);
  }

  private generateKeywordFindingRegex(regexKeywordList: string[]): RegExp {
    let regexString = '';
    regexKeywordList.forEach((keyword) => {
      regexString += `\\b${keyword}\\b|`;
    });

    regexString = regexString.slice(0, regexString.lastIndexOf(`|`));

    let compiledCaseInsensitiveRegex: RegExp = new RegExp(regexString, 'i');
    console.log(`KeywordUtils | Generated keyword finding regex: ${compiledCaseInsensitiveRegex}`);
    return compiledCaseInsensitiveRegex;
  };
}