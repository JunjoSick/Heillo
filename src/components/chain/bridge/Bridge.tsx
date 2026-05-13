import type { VisualChange } from "../visualOps";
import { BridgeCluster } from "./BridgeCluster";
import { BridgeDeletion } from "./BridgeDeletion";
import { BridgeHomophone } from "./BridgeHomophone";
import { BridgeInsertion } from "./BridgeInsertion";
import { BridgeLengthening } from "./BridgeLengthening";
import { BridgeOnset } from "./BridgeOnset";
import { BridgeShortening } from "./BridgeShortening";
import { BridgeSubstitution } from "./BridgeSubstitution";
import { BridgeSwap } from "./BridgeSwap";
import { MultiChangeBridge } from "./MultiChangeBridge";
import type { BridgeSource } from "./BridgeShell";

export interface BridgeProps {
  visualChanges: VisualChange[];
  source: BridgeSource;
}

export function Bridge({ visualChanges, source }: BridgeProps) {
  if (source === "start" || visualChanges.length === 0) return null;

  if (visualChanges.length > 1) {
    return <MultiChangeBridge changes={visualChanges} source={source} />;
  }

  const change = visualChanges[0];
  switch (change.type) {
    case "substitution":
      return <BridgeSubstitution change={change} source={source} />;
    case "insertion":
      return <BridgeInsertion change={change} source={source} />;
    case "deletion":
      return <BridgeDeletion change={change} source={source} />;
    case "swap":
      return <BridgeSwap change={change} source={source} />;
    case "lengthening":
      return <BridgeLengthening change={change} source={source} />;
    case "shortening":
      return <BridgeShortening change={change} source={source} />;
    case "cluster-change":
      return <BridgeCluster change={change} source={source} />;
    case "onset-change":
      return <BridgeOnset change={change} source={source} />;
    case "homophone":
      return <BridgeHomophone change={change} source={source} />;
    case "noop":
    case "invalid":
    default:
      return null;
  }
}
