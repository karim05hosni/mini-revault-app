💰 Monetary Calculations & Financial Integrity
Why We Don’t Use Floating-Point Numbers

JavaScript uses floating-point arithmetic for numbers, which can produce unexpected rounding errors:

0.1 + 0.2 !== 0.3 // true


In financial systems, even a small rounding error is unacceptable.
To ensure accuracy and prevent precision issues, this application never uses floating-point numbers for monetary values.

How Money Is Stored

All monetary values are stored in the database as integer cents.

Example:

Human Value	Stored Value
100.00 EUR	10000
246.67 USD	24667
0.99 EUR	99

Instead of storing decimals, we multiply all amounts by 100 and store them as integers.

Database Example
balance_cents INT NOT NULL CHECK (balance_cents >= 0)
amount_cents INT NOT NULL CHECK (amount_cents > 0)


This guarantees:

No floating-point rounding issues

Deterministic arithmetic

Database-level protection against negative balances

How Arithmetic Works

All financial operations are performed using integer arithmetic.

Example: Transfer 50.25 EUR
const amountCents = 5025;

sender.balanceCents -= amountCents;
receiver.balanceCents += amountCents;


Since all values are integers, operations are exact and safe.

Balance Protection

To ensure financial correctness:

All transfers run inside a database transaction

Wallet rows are locked using pessimistic locking

A balance check is performed before deduction

The database enforces balance_cents >= 0

This prevents:

Race conditions

Double spending

Negative balances

Precision errors

Currency Conversion

For currency conversion:

The amount in cents is multiplied by a mocked exchange rate.

The result is rounded safely using integer math.

The converted value is stored as integer cents in the target wallet.

All conversion logic is handled server-side.
The frontend never controls monetary calculations.

Production Considerations

In a real banking system, additional safeguards would include:

Fixed-precision decimal libraries

Ledger-based event sourcing

Immutable transaction logs

External audit reconciliation

This implementation focuses on deterministic, safe arithmetic suitable for a production-grade financial foundation.