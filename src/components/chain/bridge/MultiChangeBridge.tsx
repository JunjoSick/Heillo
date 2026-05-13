import type { VisualChange } from "../visualOps";
import { BridgeShell, type BridgeSource } from "./BridgeShell";
import { MiniChange } from "./MiniChange";
import { ruleTint } from "./bridgeUtils";

function dominantTint(changes: VisualChange[]): string {
  const heaviest = [...changes].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0))[0];
  return ruleTint(heaviest.type).c;
}

export function MultiChangeBridge({
  changes,
  source
}: {
  changes: VisualChange[];
  source: BridgeSource;
}) {
  const tint = dominantTint(changes);
  const totalCost = changes.reduce((sum, c) => sum + (c.cost ?? 0), 0);
  return (
    <BridgeShell
      tint={tint}
      accentLabel="compound"
      accentDetail={`${changes.length} changes · cost ${totalCost.toFixed(2)}`}
      source={source}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          maxWidth: "100%",
          justifyContent: "center"
        }}
      >
        {changes.map((change, index) => (
          <MiniChange key={index} change={change} />
        ))}
      </div>
    </BridgeShell>
  );
}
