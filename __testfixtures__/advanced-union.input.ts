type Uuid = string;

export type InventoryAction =
  | { tag: 'Unknown' }
  | { tag: 'Split'; from: Uuid; count: number }
  | { tag: 'Merge'; from: Uuid; to: number }
  | { tag: 'Move'; item: Uuid; index: number };
