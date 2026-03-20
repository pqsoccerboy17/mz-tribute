-- RPC function for curation scripts to toggle is_approved
-- Bypasses RLS (SECURITY DEFINER) so anon key can curate content
CREATE OR REPLACE FUNCTION set_memory_approval(memory_id uuid, approved boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE memories SET is_approved = approved, updated_at = now() WHERE id = memory_id;
END; $$;
