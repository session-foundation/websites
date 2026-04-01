import { SESSION_NODE } from '@/lib/constants';

export const blocksInMs = (blocks: number) => blocks * SESSION_NODE.MS_PER_BLOCK;
export const msInBlocks = (ms: number) => Math.floor(ms / SESSION_NODE.MS_PER_BLOCK);

export class BlockTimeManager {
  private readonly networkTime: number;
  private readonly currentBlock: number;

  constructor(networkTime: number, currentBlock: number) {
    this.networkTime = networkTime;
    this.currentBlock = currentBlock;
  }

  getDateOfBlock(targetBlock: number) {
    return new Date(this.networkTime * 1000 + blocksInMs(targetBlock - this.currentBlock));
  }
}
