CREATE TABLE product_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_product_id TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL DEFAULT 'payt' CHECK (gateway IN ('payt')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(external_product_id, gateway)
);

CREATE INDEX idx_product_mappings_external ON product_mappings(external_product_id, gateway);

-- Enable RLS
ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;

-- Admin-only SELECT policy
CREATE POLICY "admin_select_product_mappings"
  ON product_mappings FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admin-only INSERT policy
CREATE POLICY "admin_insert_product_mappings"
  ON product_mappings FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admin-only DELETE policy
CREATE POLICY "admin_delete_product_mappings"
  ON product_mappings FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Service role full access (for webhook processing)
CREATE POLICY "service_role_all_product_mappings"
  ON product_mappings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
