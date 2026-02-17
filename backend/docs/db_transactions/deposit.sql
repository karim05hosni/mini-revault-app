BEGIN;

-- Lock the wallet row
SELECT * FROM wallets
WHERE id = $1
FOR UPDATE;

-- Increase balance
UPDATE wallets
SET balance_cents = balance_cents + $2
WHERE id = $1;

-- Insert transaction log
INSERT INTO transactions (
    id,
    type,
    receiver_wallet_id,
    amount_cents,
    currency,
    status,
    created_at
)
VALUES (
    gen_random_uuid(),
    'deposit',
    $1,
    $2,
    $3,
    'completed',
    NOW()
);

COMMIT;
