BEGIN;

-- Lock sender wallet
SELECT * FROM wallets
WHERE id = $1
FOR UPDATE;

-- Lock receiver wallet
SELECT * FROM wallets
WHERE id = $2
FOR UPDATE;

-- Validate balance in app layer
-- If insufficient → ROLLBACK

-- Deduct sender
UPDATE wallets
SET balance_cents = balance_cents - $3
WHERE id = $1;

-- Add to receiver
UPDATE wallets
SET balance_cents = balance_cents + $3
WHERE id = $2;

-- Insert transaction log
INSERT INTO transactions (
    id,
    type,
    sender_wallet_id,
    receiver_wallet_id,
    amount_cents,
    currency,
    status,
    created_at
)
VALUES (
    gen_random_uuid(),
    'transfer',
    $1,
    $2,
    $3,
    $4,
    'completed',
    NOW()
);

COMMIT;
