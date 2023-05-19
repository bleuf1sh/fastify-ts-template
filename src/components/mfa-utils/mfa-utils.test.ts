import { MfaUtils } from './mfa-utils';
import { UtilityBelt } from '../utility-belt/utility-belt';



describe("MfaUtils", () => {

  const uBelt = new UtilityBelt('TEST|MfaUtils');

  it("should be able to read the qr code", async () => {
    const qrData = await MfaUtils.readQrCode('assets-tests/chromeadmin.qrcode.png');
    expect(qrData).toEqual('https://ChromeAdmin.com');
  }, 20000);

  it("should be able to generate a token", async () => {
    const qrData = await MfaUtils.readQrCode('assets-tests/test.mfa_qrcode.png');
    // uBelt.logDebug(qrData);
    const token = MfaUtils.parseOtpFromQrCodeAndGetToken(qrData);
    // uBelt.logDebug(token);
    expect(token).toBeTruthy();
    expect(token.length).toEqual(6);
    expect(Number(token)).toBeGreaterThan(5);
  }, 20000);

});