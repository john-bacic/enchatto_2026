import { useMemo, useRef } from "react";

/** An object written as `{…}`, or made with no prototype */
function isPlain(value: object): value is Record<string, unknown> {
  const proto = Object.getPrototypeOf(value);
  return proto === null || Object.getPrototypeOf(proto) === null;
}

/**
 * Whether two values out of a query's answer hold the same: arrays item by item, plain objects field by field,
 * everything else as `Object.is` has it. An object that is not plain (a date, a buffer) is the same only as itself.
 */
export function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  }
  if (!isPlain(a) || !isPlain(b)) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && sameValue(a[key], b[key]))
  );
}

/** The key of a document */
export const byId = (item: { _id: string }) => item._id;

/**
 * `next`, with each item that holds the same as the item of `previous` under its key replaced by that item: the
 * object a component was handed before, so that one which draws again only for another object (React.memo) is
 * left alone. An item that changed, or is new, is the one from `next`. When every item is the one `previous` has
 * in that place, the answer is `previous` itself.
 */
export function stableList<T>(previous: T[], next: T[], keyOf: (item: T) => string): T[] {
  const before = new Map(previous.map((item) => [keyOf(item), item]));
  const list = next.map((item) => {
    const key = keyOf(item);
    if (!before.has(key)) return item;
    const kept = before.get(key) as T;
    return sameValue(kept, item) ? kept : item;
  });
  return list.length === previous.length && list.every((item, i) => item === previous[i]) ? previous : list;
}

/**
 * `list` as stableList leaves it beside the list this answered with the time before. `keyOf` is one function
 * for the life of the component.
 */
export function useStableList<T>(list: T[], keyOf: (item: T) => string): T[] {
  const kept = useRef(list);
  return useMemo(() => (kept.current = stableList(kept.current, list, keyOf)), [list, keyOf]);
}
