import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import BigNumber from "bignumber.js";

import { THRESHOLD } from "./constants";

// If the difference between the current block and the previous one
// is greater than a threshold, an alert should be emitted

const blockDifficulty: { blockNumber: Number; difficulty: string } = {
  blockNumber: 0,
  difficulty: "0x0",
};

function provideHandleBlock(threshold: string): HandleBlock {
  return async function handleBlock(blockEvent: BlockEvent) {
    const findings: Finding[] = [];

    const { difficulty, number } = blockEvent.block;
    if (blockDifficulty.blockNumber === 0) return findings;

    const bigThreshold = new BigNumber(threshold);

    // check if difference between current - prev > threshold
    if (
      new BigNumber(difficulty)
        .minus(new BigNumber(blockDifficulty.difficulty))
        .isGreaterThan(bigThreshold)
    ) {
      findings.push(
        Finding.fromObject({
          name: "Difficulty Threshold Passed",
          description:
            "The difference between the current block's difficulty and the last block's difficulty is over the given threshold",
          alertId: "DIFFICULTY",
          type: FindingType.Unknown,
          severity: FindingSeverity.Low,
        })
      );
    }

    // update last block information
    blockDifficulty.blockNumber = number;
    blockDifficulty.difficulty = difficulty;

    return findings;
  };
}

export default {
  handleBlock: provideHandleBlock(THRESHOLD),
  provideHandleBlock,
};
