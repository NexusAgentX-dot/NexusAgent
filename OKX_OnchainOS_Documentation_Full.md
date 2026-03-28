# OKX Onchain OS - Complete Developer Documentation Extract

---

## 1. What is Onchain OS

**URL**: https://web3.okx.com/zh-hans/onchainos/dev-docs/home/what-is-onchainos

OKX Onchain OS is the only Web3 OS purpose-built for AI agents -- with native MCP Server support, callable AI Skills, and structured instructions that let agents autonomously fetch onchain data and execute transactions. It covers 60+ major public chains with a multichain-native architecture.

### Core Modules

| Module | Description |
|--------|-------------|
| **MCP** | Connect Onchain OS to AI agents and LLM applications via Model Context Protocol |
| **Open API** | Full-featured RESTful APIs for direct programmatic access |
| **Wallet** | Query wallet balances, broadcast transactions, retrieve transaction history |
| **Trade** | Smart routing for best quotes and optimal liquidity across pools |
| **Market** | Comprehensive multi-market and onchain data covering tokens, trades, transfers, accounts |
| **Payments** | Built on x402 protocol, supporting pay-per-use models, AI Agent friendly |

### Infrastructure Stats
- 1.2B+ daily API calls
- $300M daily trading volume
- Sub-100ms response time
- 99.9% uptime
- 60+ blockchain networks supported

### Integration Methods
1. **AI Agent conversational interaction** (MCP / AI Skills) -- agents interact with onchain services in plain language
2. **Open API** -- RESTful APIs for direct programmatic access

### AI Skills Installation
```bash
npx skills add okx/onchainos-skills
```
Install to the skill directory corresponding to your current Agent, and the Agent will complete installation automatically.

---

## 2. API Access and Authentication

**URL**: https://web3.okx.com/zh-hans/onchainos/dev-docs/home/api-access-and-usage

### Required Authentication Headers

All API requests must include:

| Header | Description |
|--------|-------------|
| `OK-ACCESS-KEY` | Your API key (unique identifier) |
| `OK-ACCESS-SIGN` | Request signature (HMAC SHA256 + Base64) |
| `OK-ACCESS-TIMESTAMP` | Request timestamp in UTC ISO format |
| `OK-ACCESS-PASSPHRASE` | Passphrase specified when creating the API key |
| `OK-ACCESS-PROJECT` | Project ID |

### Signature Generation Process

**Step 1**: Concatenate: `timestamp + method + requestPath + body`
- `timestamp`: ISO format UTC time (e.g., `2024-01-01T00:00:00.000Z`)
- `method`: HTTP method (`GET` / `POST`)
- `requestPath`: API path (e.g., `/api/v5/dex/aggregator/quote`)
- `body`: Request body for POST requests (empty string for GET)

**Step 2**: Sign using HMAC SHA256 with your secret key

**Step 3**: Encode the signature using Base64

### TypeScript Signature Helper (from dex-api-library)

```typescript
import CryptoJS from 'crypto-js';

function getHeaders(timestamp: string, method: string, requestPath: string, queryString: string) {
  const secretKey = process.env.OKX_SECRET_KEY!;
  const apiKey = process.env.OKX_API_KEY!;
  const passphrase = process.env.OKX_PASSPHRASE!;
  const projectId = process.env.OKX_PROJECT_ID!;

  const stringToSign = timestamp + method + requestPath + queryString;
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(stringToSign, secretKey)
  );

  return {
    'OK-ACCESS-KEY': apiKey,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': passphrase,
    'OK-ACCESS-PROJECT': projectId,
    'Content-Type': 'application/json',
  };
}
```

### API Key Management
- Navigate to Developer Portal > "API keys" page
- Click "Create API key"
- Enter API key name and passphrase
- System generates: API Key, Secret Key
- Passphrase encrypts the secret key on the server

### Environment Variables (.env)
```env
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
OKX_PROJECT_ID=your_project_id
```

**Security**: Never commit .env file to git.

### Rate Limits
- Rate limits differ per endpoint (check specific endpoint docs)
- Public unauthenticated REST: rate limited by IP address
- Private REST: rate limited by User ID
- WebSocket: 3 requests/second for new subscriptions, 480 total subscribe/unsubscribe/login requests per connection per hour
- Error code `50011`: "Rate limit reached"
- Strategy: Use sub-accounts to batch rate limits

### Developer Portal
**URL**: https://web3.okx.com/onchainos/dev-docs/home/developer-portal

---

## 3. Install Your Agentic Wallet

**URL**: https://web3.okx.com/zh-hans/onchainos/dev-docs/home/install-your-agentic-wallet

### Installation
```bash
npx skills add okx/onchainos-skills
```

### Setup
- Log in with email to create a wallet instantly
- No seed phrase, no key configuration needed
- Private keys generated and stored within TEE (Trusted Execution Environment)

### GitHub Repository
**URL**: https://github.com/okx/onchainos-skills

Skills for AI agents to integrate with the OKX OnchainOS API:
- Wallet (balance, portfolio)
- Token discovery
- Market data
- DEX swap
- Transaction broadcasting

### Example Workflows

**Search and Buy**:
1. `okx-dex-token` (find token)
2. `okx-wallet-portfolio` (check funds)
3. `okx-dex-swap` (execute trade)

**Portfolio Overview**:
1. `okx-wallet-portfolio` (holdings)
2. `okx-dex-token` (enrich with analytics)
3. `okx-dex-market` (price charts)

**Swap and Broadcast**:
1. `okx-dex-swap` (get tx data)
2. Sign locally
3. `okx-onchain-gateway` (broadcast)
4. `okx-onchain-gateway` (track order)

---

## 4. x402 Payments API

**URL**: https://web3.okx.com/zh-hans/onchainos/dev-docs/payments/x402-introduction

### Overview

OKX Payment API is a Web3 payment solution built on the **x402 protocol** -- an open standard designed around the HTTP 402 status code. It provides developer-friendly APIs and SDKs for pay-per-use billing, with payment settlement completed onchain.

### Key Features
- **HTTP-native**: No registration or OAuth required -- pay directly via API using tokens
- **Pay-per-use billing**: Ideal for real-time AI calls and high-frequency microtransactions
- **Gas subsidy**: Transfer and spend USDT and USDC on X Layer with zero gas fees
- **Built-in KYT**: Know Your Transaction for onchain risk detection
- **Fewer intermediaries**: Standardized flow based on HTTP protocol

### Supported Chains & Tokens
- **Chains**: X Layer (currently), more chains coming soon
- **Stablecoins**: USDG, USDC, USDT

### x402 Protocol Flow

The x402 protocol uses a three-party architecture:

```
Client  <-->  Server (Resource Provider)  <-->  Facilitator (Payment Processor)
```

**Step-by-step flow**:

1. **Client** makes an HTTP request to a resource server
2. **Server** responds with `HTTP 402 Payment Required` status + `PAYMENT-REQUIRED` header (Base64 encoded)
3. The 402 response contains payment requirements:
   ```json
   {
     "scheme": "exact",
     "network": "x-layer",
     "maxAmountRequired": "1000000",
     "payTo": "0x...",
     "asset": "0x...USDC_ADDRESS",
     "resource": "/api/v1/premium-data"
   }
   ```
4. **Client** parses the `PAYMENT-REQUIRED` header, chooses a suitable requirement from the `accepts` array
5. **Client** creates an authorization object in EIP-3009 format (transferWithAuthorization)
6. **Client** signs the authorization with **EIP-712** typed data signature:
   ```typescript
   const signature = await wallet.signTypedData(domain, types, authorization);
   ```
7. **Client** retries the original request with the signed payment payload in the `X-PAYMENT` header (or `PAYMENT-SIGNATURE` header)
8. **Server** forwards the payment payload to the facilitator's `/verify` endpoint
9. **Facilitator** verifies the signature, confirms payment parameters are valid
10. **Facilitator** settles the payment onchain (broadcasts transaction)
11. **Server** returns the requested resource to the client

### Important Technical Details

- x402 only supports payment assets implementing **EIP-3009** (`transferWithAuthorization`), e.g., USDC
- This allows a relayer to submit signed payment on-chain without setting allowances
- The facilitator abstracts blockchain integration from both client and server

### Payment Headers

| Header | Direction | Description |
|--------|-----------|-------------|
| `PAYMENT-REQUIRED` | Server -> Client | Base64-encoded payment requirements (in 402 response) |
| `X-PAYMENT` | Client -> Server | Signed payment payload (in retry request) |

---

## 5. Market API

**URL**: https://web3.okx.com/zh-hans/onchainos/dev-docs/market/market-api-introduction

### Overview

The Market API is a suite of high-performance RESTful JSON endpoints and real-time WebSocket channels providing comprehensive multi-market and onchain data for cryptocurrency tokens, trades, transactions, accounts, pulling from hundreds of DEX and CEX across different blockchain ecosystems.

### Base URL
```
https://web3.okx.com
```

### REST API Endpoints

#### Token Trading Information (Price Info)
```
POST https://web3.okx.com/api/v6/dex/market/price-info
```
- Returns token trading information: price, volume, trading info, supply, holders, liquidity
- Supports batch query: maximum 100 tokens
- Parameters:
  - `chainIndex` - Blockchain identifier
  - `tokenContractAddress` - Token contract address

#### Token Basic Information
```
POST https://web3.okx.com/api/v6/dex/market/token/basic-info
```
- Retrieves basic information about tokens
- Parameters:
  - `chainIndex` - Blockchain identifier
  - `tokenContractAddress` - Token contract address

#### Candlestick Data
```
GET https://web3.okx.com/api/v6/dex/market/candles
```
- Returns OHLCV data
- Response array format: `[ts, o, h, l, c, vol, volUsd, confirm]`
  - `ts`: Timestamp
  - `o`: Open price
  - `h`: High price
  - `l`: Low price
  - `c`: Close price
  - `vol`: Volume
  - `volUsd`: Volume in USD
  - `confirm`: Confirmation status

#### Index Prices
- Provides index prices for native and other tokens
- Calculated from prices of multiple third-party data sources

### WebSocket Real-time Data

**Endpoint**: `wss://ws.okx.com:8443/ws/v5/public`

**Available Channels**:
- Tickers channel (pushes every 100ms on update, otherwise every 60s)
- K-Line (candlestick) channel
- Limit price channel
- Order book channel
- Mark price channel

**Connection Limits**:
- 3 requests/second (IP-based)
- 480 subscribe/unsubscribe/login requests per connection per hour

### Use Cases
- Monitor token performance across DEX/CEX in real-time
- Analyze portfolio changes
- Identify trading opportunities
- Build market dashboards

---

## 6. Trade / DEX API

**URL**: https://web3.okx.com/zh-hans/onchainos/dev-docs/trade/dex-api-introduction

### Overview

Smart routing aggregator that finds best quotes and optimal liquidity across pools. Supports single-chain and cross-chain swaps.

### Base URL
```
https://web3.okx.com
```

### Core Endpoints

#### Get Quote
```
GET /api/v5/dex/aggregator/quote
```
or (v6):
```
GET /api/v6/dex/aggregator/quote
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chainId` / `chainIndex` | string | Yes | Blockchain chain ID |
| `fromTokenAddress` | string | Yes | Source token contract address |
| `toTokenAddress` | string | Yes | Destination token contract address |
| `amount` | string | Yes | Amount in smallest unit (wei/lamports) |
| `slippage` / `slippagePercent` | string | Yes | Max slippage (e.g., "0.5" for 0.5%) |

**Response** includes:
- `dexRouterList`: Router information and sub-routes
- Token details (decimals, symbols, prices)
- `estimateGasFee`
- Price impact percentage

#### Get Swap Data
```
GET /api/v5/dex/aggregator/swap
```
or (v6):
```
GET /api/v6/dex/aggregator/swap
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chainId` / `chainIndex` | string | Yes | Chain ID |
| `fromTokenAddress` | string | Yes | Source token address |
| `toTokenAddress` | string | Yes | Destination token address |
| `amount` | string | Yes | Amount in smallest unit |
| `slippage` / `slippagePercent` | string | Yes | Slippage tolerance |
| `userWalletAddress` | string | Yes | User's wallet address |
| `disableRFQ` | boolean | No | Disable RFQ quotes (default: false, RFQ enabled) |
| `excludeDexIds` | string | No | Exclude specific liquidity sources |

**Response** (EVM):
```json
{
  "code": "0",
  "data": [
    {
      "tx": {
        "to": "0x...dexContractAddress",
        "data": "0x...calldata",
        "value": "0",
        "gasLimit": "250000"
      }
    }
  ],
  "msg": ""
}
```

#### Approve Transaction
```
GET /api/v6/dex/aggregator/approve-transaction
```

**Response**:
```json
{
  "code": "0",
  "data": [
    {
      "data": "0x095ea7b3...",
      "dexContractAddress": "0xc67879F4065d3B9fe1C09EE990B891Aa8E3a4c2f",
      "gasLimit": "50000",
      "gasPrice": "110000000"
    }
  ],
  "msg": ""
}
```

#### Get Supported Chains
```
GET /api/v5/dex/aggregator/supported/chains
```

#### Transaction History
```
GET /dex/aggregator/history
```
- Comprehensive swap execution details
- Token-specific information, fees paid, blockchain data

#### Order Tracking
```
GET /dex/post-transaction/orders
```
- Uses order ID from broadcast API
- Status codes: 1 = Pending, 2 = Success, 3 = Failed

### Supported Chains (Chain IDs)

| Chain ID | Network |
|----------|---------|
| 1 | Ethereum |
| 56 | BNB Chain |
| 137 | Polygon |
| 42161 | Arbitrum |
| 10 | Optimism |
| 43114 | Avalanche C-Chain |
| 250 | Fantom |
| 66 | OKTC |
| 501 | Solana |
| 784 | Sui |
| 196 | X Layer |
| (TON) | TON |
| (TRON) | TRON |

### OKX DEX SDK

**Installation**:
```bash
npm install @okx-dex/okx-dex-sdk
# or
yarn add @okx-dex/okx-dex-sdk
# or
pnpm add @okx-dex/okx-dex-sdk
```

**Initialize Client**:
```typescript
import { OKXDexClient } from '@okx-dex/okx-dex-sdk';

const client = new OKXDexClient({
  apiKey: process.env.OKX_API_KEY,
  secretKey: process.env.OKX_SECRET_KEY,
  apiPassphrase: process.env.OKX_PASSPHRASE,
  projectId: process.env.OKX_PROJECT_ID,
});
```

**Quote Examples**:

EVM (Base Chain, chainIndex 8453):
```typescript
const quote = await client.dex.getQuote({
  chainIndex: '8453',
  fromTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
  toTokenAddress: '0x4200000000000000000000000000000000000006',   // WETH
  amount: '1000000',
  slippagePercent: '0.5',
});
```

Solana (chainIndex 501):
```typescript
const quote = await client.dex.getQuote({
  chainIndex: '501',
  fromTokenAddress: '11111111111111111111111111111111',              // SOL
  toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amount: '100000000', // 0.1 SOL in lamports
  slippagePercent: '0.5',
});
```

Sui (chainIndex 784):
```typescript
const quote = await client.dex.getQuote({
  chainId: '784',
  fromTokenAddress: '0x2::sui::SUI',
  toTokenAddress: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  amount: '100000000',
  slippage: '0.005',
});
```

**SDK Features**:
- Real-time quotes
- Multi-chain token swaps
- Token approvals
- Liquidity data
- Gas estimation
- Slippage protection
- Full TypeScript support with type safety
- Built-in retry logic, error handling, transaction management

### dex-api-library (Lower-level)

**GitHub**: https://github.com/okx/dex-api-library

Collection of TypeScript scripts for EVM, Solana, TON, and TRON networks.

**Authentication Helper** (`lib/shared.ts`):
```typescript
import CryptoJS from 'crypto-js';

export function getHeaders(
  timestamp: string,
  method: string,
  requestPath: string,
  queryString: string
) {
  // ... HMAC-SHA256 signing logic
}
```

### Smart Contract
**URL**: https://web3.okx.com/onchainos/dev-docs/trade/dex-smart-contract

### Market Maker Integration
**URL**: https://web3.okx.com/onchainos/dev-docs/trade/dex-api-market-maker

---

## 7. Agentic Wallet

**URL**: https://web3.okx.com/zh-hans/onchainos/dev-docs/wallet/agentic-wallet

### Overview

Agentic Wallet is a dedicated onchain wallet for AI Agents -- turning them from query assistants into **onchain executors** that can hold assets, sign, and submit transactions.

### Key Features

| Feature | Details |
|---------|---------|
| **Quick Setup** | Log in with email, wallet created instantly. No seed phrase or key configuration. |
| **TEE Security** | Private keys generated and stored in Trusted Execution Environment. AI Agents cannot access keys -- including OKX. |
| **Multi-chain** | Trade and transfer across ~20 networks including Solana and EVM networks |
| **Risk Simulation** | Every transaction simulated first. Plain-language description of swaps before approval. |
| **Risk Grading** | Transactions risk-graded; critical ones blocked automatically |
| **Audit Trail** | All operations safe and auditable |

### Connection Methods
- **MCP** (Model Context Protocol)
- **CLI** (Command Line Interface)

### Supported Operations
- Create wallet (via email login)
- Query wallet balance / portfolio
- Sign transactions
- Submit/broadcast transactions
- Token swaps
- Transfer tokens

### Supported Chains
~20 chains including:
- Ethereum and EVM-compatible networks
- Solana
- (Additional chains as listed in Trade API supported chains)

### Security Architecture

```
[AI Agent] --MCP/CLI--> [Agentic Wallet API] --> [TEE Secure Environment]
                                                       |
                                                  Private Key Generation
                                                  Private Key Storage
                                                  Transaction Signing
```

- Private key generation, storage, and signing ALL completed within TEE
- OKX itself cannot access private keys
- Backed by the trading engine and security system serving tens of millions of users

### Installation & Setup

1. Install onchainos-skills:
```bash
npx skills add okx/onchainos-skills
```

2. Configure API credentials in `.env`:
```env
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
```

3. Agents interact via natural language through MCP or CLI

### Agentic Wallet Documentation
- Overview: https://web3.okx.com/onchainos/dev-docs/home/agentic-wallet-overview
- Install: https://web3.okx.com/onchainos/dev-docs/home/install-your-agentic-wallet

---

## 8. Additional Resources

### GitHub Repositories
| Repository | Description | URL |
|-----------|-------------|-----|
| onchainos-skills | AI agent skills for OnchainOS | https://github.com/okx/onchainos-skills |
| dex-api-library | TypeScript scripts for DEX API (EVM, Solana, TON, TRON) | https://github.com/okx/dex-api-library |
| okx-dex-sdk | TypeScript SDK for OKX DEX | https://github.com/okx/okx-dex-sdk |
| js-wallet-sdk | Multi-chain TypeScript signature SDK | https://github.com/okx/js-wallet-sdk |

### NPM Packages
| Package | Install Command |
|---------|----------------|
| OKX DEX SDK | `npm install @okx-dex/okx-dex-sdk` |
| OnchainOS Skills | `npx skills add okx/onchainos-skills` |

### Documentation Links
| Page | URL |
|------|-----|
| What is OnchainOS | https://web3.okx.com/onchainos/dev-docs/home/what-is-onchainos |
| Authentication | https://web3.okx.com/onchainos/dev-docs/home/api-access-and-usage |
| Developer Portal | https://web3.okx.com/onchainos/dev-docs/home/developer-portal |
| Install Agentic Wallet | https://web3.okx.com/onchainos/dev-docs/home/install-your-agentic-wallet |
| x402 Payments | https://web3.okx.com/onchainos/dev-docs/payments/x402-introduction |
| Market API | https://web3.okx.com/onchainos/dev-docs/market/market-api-introduction |
| Trade/DEX API | https://web3.okx.com/onchainos/dev-docs/trade/dex-api-introduction |
| DEX SDK | https://web3.okx.com/onchainos/dev-docs/trade/dex-sdk-introduction |
| EVM Swap Guide | https://web3.okx.com/onchainos/dev-docs/trade/dex-use-swap-quick-start |
| Agentic Wallet | https://web3.okx.com/onchainos/dev-docs/wallet/agentic-wallet |
| Change Log | https://web3.okx.com/onchainos/dev-docs/home/change-log |
| Smart Contract | https://web3.okx.com/onchainos/dev-docs/trade/dex-smart-contract |
| Market Maker | https://web3.okx.com/onchainos/dev-docs/trade/dex-api-market-maker |

### Alternative URL Paths
Some documentation is available under both `/onchainos/` and `/onchain-os/` paths:
- `https://web3.okx.com/onchainos/dev-docs/...`
- `https://web3.okx.com/onchain-os/dev-docs/...`
- `https://web3.okx.com/build/dev-docs/...` (older path)

---

## IMPORTANT NOTES

1. **API Versioning**: The documentation references both v5 and v6 API endpoints. v6 appears to be the newer version, but v5 endpoints may still be functional. Parameter naming may differ slightly (`chainId` vs `chainIndex`, `slippage` vs `slippagePercent`).

2. **Client-side Rendered Pages**: The OKX documentation site is a React SPA. The content above was extracted via web search indexing. For the most current and complete specifications (all parameters, all response fields, exact rate limits per endpoint), visit the pages directly in a browser.

3. **x402 Protocol**: OKX's x402 implementation follows the open standard from https://www.x402.org/. The Coinbase reference implementation is at https://github.com/coinbase/x402.
