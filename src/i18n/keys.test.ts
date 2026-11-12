import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { resources } from "./resources";

/**
 * TypeScript can't check i18next keys here (strict mode is off), so this test does:
 * every t("ns:key") / i18n.t("ns:key") / i18nKey="ns:key" in src must exist in English.
 * Keys must carry their namespace prefix so the lookup is unambiguous.
 */
type Tree = { [k: string]: string | Tree };
const flatten = (tree: Tree, prefix = ""): string[] =>
  Object.entries(tree).flatMap(([k, v]) => (typeof v === "string" ? [`${prefix}${k}`] : flatten(v, `${prefix}${k}.`)));

const known = new Set(
  Object.entries(resources.en).flatMap(([ns, tree]) => flatten(tree as Tree).map((k) => `${ns}:${k}`)),
);
const PLURAL = ["_zero", "_one", "_two", "_few", "_many", "_other"];
const exists = (key: string) => known.has(key) || PLURAL.some((s) => known.has(key + s));

const SRC = join(__dirname, "..");
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === "i18n" ? [] : files(p);
    return /\.(tsx?|jsx?)$/.test(name) && !/\.test\./.test(name) ? [p] : [];
  });
}

const CALL = /(?:\bt|i18n\.t)\(\s*(["'`])([^"'`$]+?)\1/g;
const ATTR = /i18nKey=\s*(["'])([^"']+)\1/g;

describe("translation keys used in src", () => {
  const missing: string[] = [];
  const unprefixed: string[] = [];
  for (const file of files(SRC)) {
    const text = readFileSync(file, "utf8");
    if (!/react-i18next|@\/i18n/.test(text)) continue;
    for (const re of [CALL, ATTR]) {
      for (const m of text.matchAll(re)) {
        const key = m[2];
        const where = `${relative(SRC, file)}: ${key}`;
        if (!/^[a-z_]+:/.test(key)) unprefixed.push(where);
        else if (!exists(key)) missing.push(where);
      }
    }
  }

  it("every key exists in the English resources", () => {
    expect(missing).toEqual([]);
  });

  it("every key names its namespace (ns:key)", () => {
    expect(unprefixed).toEqual([]);
  });
});
