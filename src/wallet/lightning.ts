import * as crypto from 'crypto';
import * as fs from 'fs';
import type { LNDConfig, Invoice, Payment, ChannelBalance, DecodedInvoice } from './types.js';

export class LightningWallet {
  private config: LNDConfig;

  constructor(config: LNDConfig) {
    this.config = config;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: object
  ): Promise<T> {
    const url = `${this.config.restUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'macaroon': this.config.macaroon,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LND API error: ${response.status} ${error}`);
    }

    return response.json() as T;
  }

  async createInvoice(amount: number, memo: string): Promise<Invoice> {
    const response = await this.request<{
      payment_request: string;
      add_index: string;
      payment_addr: string;
    }>('POST', '/v1/invoices', {
      value: amount,
      memo,
      expiry: 3600,
    });

    return {
      paymentRequest: response.payment_request,
      addIndex: response.add_index,
      paymentAddr: response.payment_addr,
    };
  }

  async payInvoice(paymentRequest: string): Promise<Payment> {
    const response = await this.request<{
      payment_preimage: string;
      payment_hash: string;
    }>('POST', '/v1/channels/transactions', {
      payment_request: paymentRequest,
    });

    return {
      paymentPreimage: response.payment_preimage,
      paymentHash: response.payment_hash,
    };
  }

  async getBalance(): Promise<ChannelBalance> {
    const response = await this.request<{
      balance: string;
      pending_open_balance: string;
    }>('GET', '/v1/balance/channel');

    return {
      balance: parseInt(response.balance, 10),
      pendingOpenBalance: parseInt(response.pending_open_balance, 10),
    };
  }

  async decodeInvoice(paymentRequest: string): Promise<DecodedInvoice> {
    const response = await this.request<{
      destination: string;
      payment_hash: string;
      num_satoshis: string;
      timestamp: string;
      expiry: string;
      description: string;
      fallback_addr: string;
      cltv_expiry: string;
    }>('GET', '/v1/payreq/' + encodeURIComponent(paymentRequest));

    return {
      destination: response.destination,
      paymentHash: response.payment_hash,
      numSatoshis: response.num_satoshis,
      timestamp: response.timestamp,
      expiry: response.expiry,
      description: response.description,
      fallbackAddr: response.fallback_addr,
      cltvExpiry: response.cltv_expiry,
    };
  }

  async subscribeToPayments(): Promise<AsyncIterator<{
    paymentHash: string;
    amount: number;
    status: 'settled' | 'failed' | 'in_flight';
  }>> {
    const url = `${this.config.restUrl}/v1/payments?indexify=true`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'macaroon': this.config.macaroon,
      'Accept': 'text/event-stream',
    };

    const response = await fetch(url, { method: 'GET', headers });
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let buffer = '';
    
    const iterator: AsyncIterator<{
      paymentHash: string;
      amount: number;
      status: 'settled' | 'failed' | 'in_flight';
    }> = {
      next: async (): Promise<IteratorResult<{
        paymentHash: string;
        amount: number;
        status: 'settled' | 'failed' | 'in_flight';
      }>> => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return { done: true, value: undefined };
          }
          
          buffer += new TextDecoder().decode(value);
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const payment = JSON.parse(data);
                return {
                  done: false,
                  value: {
                    paymentHash: payment.payment_hash,
                    amount: parseInt(payment.value_sat, 10),
                    status: payment.state,
                  },
                };
              } catch {
                continue;
              }
            }
          }
        }
      },
    };

    return iterator;
  }
}

export function createLightningWallet(): LightningWallet {
  const restUrl = process.env.LND_REST_URL || 'https://localhost:8080';
  const macaroonPath = process.env.LND_MACAROON_PATH;
  const certPath = process.env.LND_CERT_PATH;

  if (!macaroonPath) {
    throw new Error('LND_MACAROON_PATH environment variable is required');
  }

  const macaroon = fs
    .readFileSync(macaroonPath)
    .toString('hex');

  return new LightningWallet({
    restUrl,
    macaroon,
    certPath,
  });
}

export type { LNDConfig, Invoice, Payment, ChannelBalance, DecodedInvoice };
