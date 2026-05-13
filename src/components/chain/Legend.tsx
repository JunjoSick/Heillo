import { ruleTint, type ChainRule } from "./diff";

const RULES: Array<[ChainRule, string]> = [
  ["substitution", "sub"],
  ["insertion", "add"],
  ["deletion", "drop"],
  ["swap", "swap"],
  ["lengthening", "lengthen"],
  ["shortening", "shorten"],
  ["cluster-change", "cluster"],
  ["onset-change", "onset"]
];

export function Legend() {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "0 24px 8px",
        flexWrap: "wrap",
        justifyContent: "center"
      }}
    >
      {RULES.map(([type, label]) => {
        const tint = ruleTint(type);
        return (
          <span
            key={type}
            className="pill"
            style={{
              borderColor: tint.c,
              color: tint.c,
              background: tint.bg,
              fontSize: 10,
              padding: "2px 8px"
            }}
          >
            <span className="swatch" style={{ background: tint.c }} />
            {label}
          </span>
        );
      })}
    </div>
  );
}
