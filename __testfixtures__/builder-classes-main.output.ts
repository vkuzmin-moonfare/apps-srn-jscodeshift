type Uuid = string;

export type InventoryActionUnknown = { tag: "Unknown" };

export type InventoryActionSplit = {
  tag: "Split",
  from: Uuid,
  count: number,
};

export type InventoryActionMerge = {
  tag: "Merge",
  from: Uuid,
  to: number,
};

export type InventoryActionMove = {
  tag: "Move",
  item: Uuid,
  index: number,
};

export type InventoryAction = InventoryActionUnknown | InventoryActionSplit | InventoryActionMerge | InventoryActionMove;

// start builder class InventoryActionBuilder
import {
  InventoryActionUnknown,
  InventoryActionSplit,
  InventoryActionMerge,
  InventoryActionMove,
} from "./world.d.ts";

export class InventoryActionBuilder {
  static InventoryActionUnknown = (): InventoryActionUnknown => ({
    tag: "Unknown"
  });

  static InventoryActionSplit = (
    {
      from,
      count
    }: {
      from: Uuid,
      count: number,
    }
  ): InventoryActionSplit => ({
    tag: "Split",
    from,
    count
  });

  static InventoryActionMerge = (
    {
      from,
      to
    }: {
      from: Uuid,
      to: number,
    }
  ): InventoryActionMerge => ({
    tag: "Merge",
    from,
    to
  });

  static InventoryActionMove = (
    {
      item,
      index
    }: {
      item: Uuid,
      index: number,
    }
  ): InventoryActionMove => ({
    tag: "Move",
    item,
    index
  });
}// end builder class InventoryActionBuilder
