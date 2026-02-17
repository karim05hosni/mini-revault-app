# Mini-Revault API Documentation

## Authentication

### Register
- **POST** `/auth/register`
- **Body:**
  - `fullName` (string, required)
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  - `id`, `email`, `fullName`, `wallets` (array of wallet objects)

### Login
- **POST** `/auth/login`
- **Body:**
  - `email` (string, required)
  - `password` (string, required)
- **Response:**
  - `access_token` (JWT), `user` (object)

---

## Wallets

### Get Wallet Balance
- **GET** `/wallets/:walletId/balance`
- **Auth:** Bearer JWT
- **Response:**
  - `balanceCents` (number), `currency` (string)

### List User Wallets
- **GET** `/wallets/user`
- **Auth:** Bearer JWT
- **Response:**
  - Array of wallet objects

---

## Transactions

### Deposit
- **POST** `/transactions/deposit`
- **Auth:** Bearer JWT
- **Body:**
  - `walletId` (string, required)
  - `amount` (string, required, e.g. "100.00")
  - `currency` (string, required)
- **Response:**
  - `success` (boolean), `transactionId` (string)

### Withdraw
- **POST** `/transactions/withdraw`
- **Auth:** Bearer JWT
- **Body:**
  - `walletId` (string, required)
  - `amountCents` (number, required)
  - `currency` (string, required)
- **Response:**
  - `success` (boolean), `transactionId` (string)

### Transfer
- **POST** `/transactions/transfer`
- **Auth:** Bearer JWT
- **Body:**
  - `senderWalletId` (string, required)
  - `receiverEmail` (string, required)
  - `amount` (string, required)
  - `currency` (string, required)
- **Response:**
  - `success` (boolean), `transactionId` (string)

### Exchange Currency
- **POST** `/transactions/exchange`
- **Auth:** Bearer JWT
- **Body:**
  - `fromWalletId` (string, required)
  - `toWalletId` (string, required)
  - `amount` (string, required)
  - `currency` (string, required)
- **Response:**
  - `success` (boolean), `transactionId` (string)


### Get Transaction History
- **GET** `/transactions/history?type=...`
- **Auth:** Bearer JWT
- **Query Params:**
  - `type` (optional: `sent`, `received`, `deposit`, `withdrawal`, `transfer`, `conversion`)
- **Response:**
  - Array of transaction objects (see TransactionHistoryDto below)

#### TransactionHistoryDto
```
{
  id: string,
  type: 'deposit' | 'withdrawal' | 'transfer' | 'conversion',
  senderWalletId?: string,
  receiverWalletId?: string,
  amountCents: number,
  currency: string,
  status: 'completed' | 'failed',
  createdAt: string (ISO date)
}
```

---

## Notes
- All endpoints (except register/login) require Bearer JWT authentication.
- Amounts are in cents unless otherwise specified.
- Error responses follow standard NestJS format with `statusCode`, `message`, and `error` fields.
- Currency conversion is handled automatically for cross-currency operations.
