export type InvoicePartyRole = "from" | "to";

export type InvoiceParty = {
  role: InvoicePartyRole;
  name: string;
  address: string;
  email: string;
  phone: string;
};

export type Business = {
  name: string;
  address: string;
  email: string;
  phone: string;
};

export type Customer = {
  name: string;
  address: string;
  email: string;
};
