import { describe, expect, it } from "vitest";
import { resources } from "./resources";

type Tree = { [k: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else Object.assign(out, flatten(v, key));
  }
  return out;
}

const placeholders = (s: string) => (s.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []).map((p) => p.replace(/\s/g, "")).sort();

describe("translations", () => {
  for (const ns of Object.keys(resources.en) as (keyof typeof resources.en)[]) {
    const en = flatten(resources.en[ns] as Tree);
    const bn = flatten(resources.bn[ns] as Tree);

    it(`${ns}: Bangla has exactly the English keys`, () => {
      expect(Object.keys(bn).sort()).toEqual(Object.keys(en).sort());
    });

    it(`${ns}: no empty strings`, () => {
      const empty = [...Object.entries(en), ...Object.entries(bn)].filter(([, v]) => !v.trim()).map(([k]) => k);
      expect(empty).toEqual([]);
    });

    it(`${ns}: same {{placeholders}} in both languages`, () => {
      const bad = Object.keys(en).filter((k) => bn[k] !== undefined && placeholders(en[k]).join() !== placeholders(bn[k]).join());
      expect(bad).toEqual([]);
    });
  }
});
