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
