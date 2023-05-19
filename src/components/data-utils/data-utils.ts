import jsonlines from 'jsonlines';
import fs from 'fs-extra';
import split from 'split';
import { UtilityBelt } from '../utility-belt/utility-belt';

class _DataUtils {
  private readonly uBelt = new UtilityBelt('DataUtils');


  public async transformJsonArrayToJsonLines(itemArray: any[], jsonLinesOutputWritePath?: string) {
    const stringifier = jsonlines.stringify();
    stringifier.pipe(fs.createWriteStream(jsonLinesOutputWritePath, { flags: 'a' }));
    for (const row of itemArray) {
      stringifier.write(row, 'utf-8');
    }
    stringifier.end();
  }


  public async transformCsvToJson(csvPath: string, syncTransformFunc: (row: any) => any, jsonLinesOutputWritePath?: string) {
    const parser = fs.createReadStream(csvPath)
      .pipe(parse({
        delimiter: ',',
        columns: true,
        relax_column_count: false,
      }));


    const stringifier = jsonlines.stringify();
    // stringifier.pipe(process.stdout);
    stringifier.pipe(fs.createWriteStream(jsonLinesOutputWritePath, { flags: 'a' }));
    for await (const row of parser) {
      const transformedRow = syncTransformFunc(row);
      if (!transformedRow) { continue; }
      stringifier.write(transformedRow);
    }
    stringifier.end();
  }

  public async readJsonLines(jsonLinesPath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const a = [];
      fs.createReadStream(jsonLinesPath)
        .pipe(split(JSON.parse, null, { trailing: false }))
        .on('data', (obj) => {
          //each chunk now is a a js object
          a.push(obj);
        })
        .on('error', (err) => {
          //syntax errors will land here
          //note, this ends the stream.
          this.uBelt.logError(`${err}`);
          reject(err);
        })
        .on('end', () => {
          resolve(a);
        });
    });

  }

}

export const DataUtils = new _DataUtils();