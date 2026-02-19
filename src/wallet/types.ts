export interface LNDConfig {
  restUrl: string;
  macaroon: string;
  certPath?: string;
}

export interface Invoice {
  paymentRequest: string;
  addIndex: string;
  paymentAddr: string;
}

export interface Payment {
  paymentPreimage: string;
  paymentHash: string;
}

export interface ChannelBalance {
  balance: bigint;
  pendingOpenBalance: bigint;
}

export interface DecodedInvoice {
  destination: string;
  paymentHash: string;
  numSatoshis: string;
  timestamp: string;
  expiry: string;
  description: string;
  fallbackAddr: string;
  cltvExpiry: string;
}
