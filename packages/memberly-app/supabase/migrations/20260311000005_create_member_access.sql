-- Create member_access table
CREATE TABLE member_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by TEXT NOT NULL DEFAULT 'manual' CHECK (granted_by IN ('webhook', 'manual')),
    transaction_id TEXT,
    UNIQUE(profile_id, product_id)
);

CREATE INDEX idx_member_access_profile ON member_access(profile_id);
CREATE INDEX idx_member_access_product ON member_access(product_id);
CREATE INDEX idx_member_access_transaction ON member_access(transaction_id);
