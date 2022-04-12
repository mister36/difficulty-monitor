import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleBlock,
  createBlockEvent,
} from "forta-agent";
import agent from "./agent";

import { THRESHOLD } from "./constants";

describe("Difficulty agent", () => {
  let handleBlock: HandleBlock;
  let blockEvent1 = createBlockEvent({
    block: { number: 1, difficulty: "0x17" } as any,
  });
  let blockEvent2;

  beforeAll(() => {
    handleBlock = agent.provideHandleBlock(THRESHOLD);
  });

  it("Returns empty findings if difference in block difficulties isn't above threshold", async () => {
    blockEvent2 = createBlockEvent({
      block: { number: 2, difficulty: "0x16" } as any,
    });
    await handleBlock(blockEvent1);
    const findings = await handleBlock(blockEvent2);

    expect(findings).toStrictEqual([]);
  });

  it("Returns a finding if difference in block difficulties is above threshold", async () => {
    const number = 2;
    const difficulty = "0x15";

    blockEvent2 = createBlockEvent({
      block: { number, difficulty } as any,
    });
    await handleBlock(blockEvent1);
    const findings = await handleBlock(blockEvent2);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Difficulty Threshold Passed",
        description:
          "The difference between the current block's difficulty and the last block's difficulty is over the given threshold",
        alertId: "DIFFICULTY",
        type: FindingType.Unknown,
        severity: FindingSeverity.Low,
        metadata: {
          blockNumber: number.toString(),
          difficulty,
        },
      }),
    ]);
  });
});
