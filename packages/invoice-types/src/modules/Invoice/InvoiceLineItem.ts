export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type LineItemInput = {
  quantity: number;
  unitPrice: number;
};
