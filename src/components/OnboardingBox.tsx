export function OnboardingBox() {
  return (
    <section className="rounded border border-moss/15 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">
        This game judges words by sound, not spelling.
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Example
          result="smooth"
          rows={["gioco -> geco", "GD O K O", "GD E K O", "O -> E"]}
        />
        <Example
          result="borderline"
          rows={[
            "scena -> schema",
            "SC E N A",
            "S K E M A",
            "SC -> S K, N -> M"
          ]}
        />
        <Example
          result="invalid"
          rows={["scena -> schiena", "SC E N A", "S K J E N A", "too much changes"]}
        />
        <Example result="homophone move" rows={["ho -> o", "O", "O", "same game sound"]} />
      </div>
    </section>
  );
}

function Example({ result, rows }: { result: string; rows: string[] }) {
  return (
    <div className="rounded border border-moss/10 bg-paper p-3">
      <div className="text-sm font-semibold text-clay">{result}</div>
      <div className="mt-2 grid gap-1 text-sm text-ink">
        {rows.map((row) => (
          <div key={row}>{row}</div>
        ))}
      </div>
    </div>
  );
}
