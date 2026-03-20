-- Migration 003: Admin policies + rotation column

-- Allow authenticated users to see ALL memories (including hidden)
CREATE POLICY "Admin can view all memories"
  ON memories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add rotation column for photo orientation management
ALTER TABLE memories ADD COLUMN IF NOT EXISTS rotation smallint DEFAULT 0;

-- Secure the RPC function (add auth check)
CREATE OR REPLACE FUNCTION set_memory_approval(memory_id uuid, approved boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE memories SET is_approved = approved, updated_at = now() WHERE id = memory_id;
END; $$;
