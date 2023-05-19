import { SharedBrowserServerUtils } from "./shared-browser-server-utils";


describe("shared-browser-server-utils", () => {

  it("should give date as YYYY/MM/DD format", async () => {
    const dateString = `2022/12/13`;
    const d = SharedBrowserServerUtils.convertYyyyMmDd(dateString);
    expect(SharedBrowserServerUtils.getDateAsYyyyMmDd(d)).toEqual(dateString);
  }, 20000);


  it("should be able to parse the YYYY/MM/DD date string", async () => {
    const d = SharedBrowserServerUtils.convertYyyyMmDd(`2022/12/12`);
    expect(d).toBeTruthy();
    expect(d.toString()).toContain('Mon Dec 12 2022 20:00:00 GMT-0600 (Central Standard Time)');
    expect(d.toString()).toContain('Central');
    expect(d.toISOString()).toEqual('2022-12-13T02:00:00.000Z');
  }, 20000);


  it("should calculate days diff", async () => {
    const early = SharedBrowserServerUtils.convertYyyyMmDd(`2022/01/01`);
    const later = SharedBrowserServerUtils.convertYyyyMmDd(`2022/01/10`);
    expect(SharedBrowserServerUtils.getDaysDiff(early, later)).toEqual(9);
  }, 20000);


  it("should be able to add days", async () => {
    const dt = SharedBrowserServerUtils.convertYyyyMmDd(`2022/01/01`);
    const addedDt = SharedBrowserServerUtils.addDaysToDate(dt, 9)
    expect(addedDt.toString()).toContain('Mon Jan 10 2022 20:00:00 GMT-0600 (Central Standard Time)');
  }, 20000);

});