-- Adiciona a coluna 'active' se ainda não existir
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Índice para buscas recorrentes por ativos (opcional)
CREATE INDEX IF NOT EXISTS idx_professionals_active ON professionals(active);