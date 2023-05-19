import { addDays, differenceInCalendarDays, differenceInCalendarWeeks, format, parse } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz'


class _SharedBrowserServerUtils {

  private readonly timeZone = "America/Chicago";
  public nowRefDateUTC = new Date();
  public nowYyyyMmDd: string = '';
  constructor() {
    this.keepNowRefDateFresh();
  }

  private keepNowRefDateFresh() {
    this.nowRefDateUTC = new Date();
    this.nowYyyyMmDd = this.getDateAsYyyyMmDd(this.nowRefDateUTC);
    setTimeout(() => { this.keepNowRefDateFresh(); }, 5 * 60_000);
  }

  public getDateAsYyyyMmDd(d: Date) {
    let options: Intl.DateTimeFormatOptions = {
      timeZone: this.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const mmDdYyyy = formatter.format(d);
    const [mm, dd, yyyy] = mmDdYyyy.split(`/`);
    return `${yyyy}/${mm}/${dd}`;
  }

  public getDateAsVerbose(d: Date) {
    let options: Intl.DateTimeFormatOptions = {
      timeZone: this.timeZone,
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    return formatter.format(d);
  }

  public convertYyyyMmDd(yyyyMmDd: string = ''): Date {
    const utcDate = zonedTimeToUtc(
      `${yyyyMmDd.split('/').join('-')} 20:00:00`,
      this.timeZone
    )
    return utcDate;
    // return parse(`${yyyyMmDd} `, 'yyyy/MM/dd', this.refDate);
  }

  public getDaysDiff(earlier: Date, later: Date): number {
    return differenceInCalendarDays(later, earlier);
  }

  public addDaysToDate(date: Date, daysToAdd: number): Date {
    return addDays(date, daysToAdd);
  }

}

export const SharedBrowserServerUtils = new _SharedBrowserServerUtils();