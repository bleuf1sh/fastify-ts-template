import { UtilityBelt } from './../components/utility-belt/utility-belt';
import fs from 'fs-extra';
import 'ts-node/register';
import path from 'node:path';


class _EnvData {

  public readonly serverPort = process.env[`PORT`] || `8080`;

  private secrets: Secrets;
  public getSecrets() {
    if (this.secrets) { return this.secrets; }

    const renderSecretsPath = `/etc/secrets/secrets.ts`;
    const filePath = fs.existsSync(renderSecretsPath) ? renderSecretsPath : path.resolve(`secrets`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require(filePath);
    console.log(`Secrets loaded...${UtilityBelt.pretty(Object.keys(data))}`);
    this.secrets = data;
    return this.secrets;
  };

}

export const EnvData = new _EnvData();

interface Secrets {
  testSecret: string,
}