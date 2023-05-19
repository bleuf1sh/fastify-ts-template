import { UtilityBelt } from "./utility-belt";
import { parse } from 'date-fns'
import * as jestDateMock from "jest-date-mock";


describe("UtilityBelt", () => {

  const uBelt = new UtilityBelt('uBeltTest');

  beforeEach(() => {
    jest.spyOn(console, 'log');
  });

  describe("Defaults", () => {

    const randomString: string = '' + Date.now();

    it("should log debug", () => {
      uBelt.logDebug(randomString);
      expect(console.log).toHaveBeenCalled();
    });

    it("should log info", () => {
      uBelt.logInfo(randomString);
      expect(console.log).toHaveBeenCalled();
    });

    it("should log warning", () => {
      uBelt.logWarning(randomString);
      expect(console.log).toHaveBeenCalledTimes(2);
    });

    it("should log error", () => {
      uBelt.logError(randomString);
      expect(console.log).toHaveBeenCalledTimes(2);
    });

  });

  describe("Env Flags", () => {

    const envBackup = Object.assign({}, process.env);
    const randomString: string = '' + Date.now();

    afterEach(() => {
      process.env = envBackup;
    });

    it("should log debug", () => {
      process.env.HIDE_DBUG_LOGS = 'true';
      uBelt.logDebug(randomString);
      expect(console.log).toHaveBeenCalledTimes(0);

      process.env.HIDE_DBUG_LOGS = '';
      uBelt.logDebug(randomString);
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it("should log info", () => {
      process.env.HIDE_INFO_LOGS = 'true';
      uBelt.logInfo(randomString);
      expect(console.log).toHaveBeenCalledTimes(0);

      process.env.HIDE_INFO_LOGS = '';
      uBelt.logInfo(randomString);
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it("should log warning", () => {
      process.env.HIDE_WARN_LOGS = 'true';
      uBelt.logWarning(randomString);
      expect(console.log).toHaveBeenCalledTimes(0);

      process.env.HIDE_WARN_LOGS = '';
      uBelt.logWarning(randomString);
      expect(console.log).toHaveBeenCalledTimes(2);
    });

    it("should log error", () => {
      process.env.HIDE_ERRR_LOGS = 'true';
      uBelt.logError(randomString);
      expect(console.log).toHaveBeenCalledTimes(0);

      process.env.HIDE_ERRR_LOGS = '';
      uBelt.logError(randomString);
      expect(console.log).toHaveBeenCalledTimes(2);
    });

  });

  describe("Dates and Clocks", () => {
    beforeEach(() => {
      const today = parse('2015-10-19', 'yyyy-MM-dd', new Date())
      jestDateMock.advanceTo(today);
    });

    afterEach(() => {
      jestDateMock.clear();
    });

    it('should return human date', ()=>{
      expect(UtilityBelt.getHumanDate()).toEqual('2015-10-19 00:00:00.000');
    });

    it('should return pretty uptime', ()=>{
      jest.spyOn(process, 'uptime').mockReturnValue(10000);
      expect(UtilityBelt.getPrettyUptime()).toEqual('2h 46m 40s');
      jest.spyOn(process, 'uptime').mockReturnValue(60);
      expect(UtilityBelt.getPrettyUptime()).toEqual('1m');
    });

  });

});