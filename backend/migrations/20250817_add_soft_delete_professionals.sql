-- Adiciona colunas para soft delete (idempotente)
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- (Opcional) Índice para buscas por ativos
CREATE INDEX IF NOT EXISTS idx_professionals_active ON professionals(active);

-- (Opcional) Se quiser garantir que não haja active = true com deleted_at preenchido:
-- CREATE OR REPLACE FUNCTION trg_professionals_deleted_at_consistency()
-- RETURNS trigger AS $$
-- BEGIN
--   IF NEW.deleted_at IS NOT NULL THEN
--     NEW.active := false;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER professionals_deleted_at_consistency
-- BEFORE INSERT OR UPDATE ON professionals
-- FOR EACH ROW EXECUTE FUNCTION trg_professionals_deleted_at_consistency();