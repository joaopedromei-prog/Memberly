-- Add certificate_enabled column to products
ALTER TABLE products
ADD COLUMN certificate_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Comment for documentation
COMMENT ON COLUMN products.certificate_enabled IS 'Whether completion certificates are enabled for this product';
