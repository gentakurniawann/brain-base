import { Injectable } from '@nestjs/common';

@Injectable()
export class IpfsService {
  async pinJson(obj: any) {
    return { cid: 'bafyMockCid' };
  }
}
