import { EnvData } from './env-data';
import fs from 'fs-extra';
import { UtilityBelt } from '../components/utility-belt/utility-belt';



describe("EnvData", () => {

  const uBelt = new UtilityBelt('TEST|EnvData');

  // if this fails, simply create a secrets.ts file in the root project dir and add this line
  // export const testSecret = `beep`;
  it("should be able to read and access secrets", async () => {
    const secrets = EnvData.getSecrets();
    expect(secrets).toBeTruthy();
    expect(secrets.testSecret).toBeTruthy();
    expect(secrets.testSecret).toEqual('beep');
  }, 20000);


});