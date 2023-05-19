const QrCode = require('qrcode-reader');
import Jimp from 'jimp';
import fs from 'fs-extra';
import { authenticator } from 'otplib';
import { UtilityBelt } from '../utility-belt/utility-belt';


class _MfaUtils {

  private readonly uBelt = new UtilityBelt('MfaUtils');

  public async waitForMfaTime() {
    while(true) {
      if (authenticator.timeRemaining() >= 10) { return; }

      await UtilityBelt.waitMs(500);
    }
  }

  public parseOtpFromQrCodeAndGetToken(otpFromQrCode: string) {
    const otpUrl = new URL(otpFromQrCode);
    const otpSecret = otpUrl.searchParams.get('secret');
    if (!otpSecret) { return ''; }

    return authenticator.generate(otpSecret);
  }

  public async readQrCode(pathToImageFile: string) {
    const img = await Jimp.read(pathToImageFile);
    return new Promise<string>((resolve, reject) => {
      const qr = new QrCode();
      qr.callback = (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value.result);
        }
      };
      qr.decode(img.bitmap);
    });
  }



}

export const MfaUtils = new _MfaUtils();