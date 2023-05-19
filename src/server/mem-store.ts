import { UtilityBelt } from "../components/utility-belt/utility-belt";
import LRU from 'lru-cache';
import { SharedBrowserServerUtils } from '../shared-browser-server-utils/shared-browser-server-utils';



class _MemStore {

  private readonly uBelt = new UtilityBelt('MemStore');

  public async init() {
    
  }
  
}

export const MemStore = new _MemStore();
