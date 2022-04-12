import {
  BlockEvent,
  Finding,
  HandleBlock,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import BigNumber from "bignumber.js";

import { THRESHOLD } from "./constants";

// If the difference between the current block and the previous one
// is greater than a threshold, an alert should be emitted

const lastDifficulty: { blockNumber: Number; difficulty: string } = {
  blockNumber: 0,
  difficulty: "0x0",
};

const updateLastDifficulty = (number: Number, difficulty: string) => {
  lastDifficulty.blockNumber = number;
  lastDifficulty.difficulty = difficulty;
};

function provideHandleBlock(threshold: string): HandleBlock {
  return async function handleBlock(blockEvent: BlockEvent) {
    const findings: Finding[] = [];

    const { difficulty, number } = blockEvent.block;

    if (lastDifficulty.blockNumber === 0) {
      updateLastDifficulty(number, difficulty);
      return findings;
    }

    // check if *absolute* difference between current and prev > threshold
    if (
      new BigNumber(difficulty)
        .minus(new BigNumber(lastDifficulty.difficulty))
        .abs()
        .isGreaterThan(new BigNumber(threshold))
    ) {
      findings.push(
        Finding.fromObject({
          name: "Difficulty Threshold Passed",
          description:
            "The difference between the current block's difficulty and the last block's difficulty is over the given threshold",
          alertId: "DIFFICULTY",
          type: FindingType.Unknown,
          severity: FindingSeverity.Low,
          metadata: {
            blockNumber: number.toString(10),
            difficulty,
          },
        })
      );
    }

    // update last block information
    updateLastDifficulty(number, difficulty);

    return findings;
  };
}

export default {
  handleBlock: provideHandleBlock(THRESHOLD),
  provideHandleBlock,
};
