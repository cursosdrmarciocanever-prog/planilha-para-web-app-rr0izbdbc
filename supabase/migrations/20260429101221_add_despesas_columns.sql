ALTER TABLE public.despesas
  ADD COLUMN IF NOT EXISTS departamento TEXT,
  ADD COLUMN IF NOT EXISTS fornecedor TEXT,
  ADD COLUMN IF NOT EXISTS plano_contas TEXT,
  ADD COLUMN IF NOT EXISTS conta_contabil TEXT,
  ADD COLUMN IF NOT EXISTS conta_bancaria TEXT,
  ADD COLUMN IF NOT EXISTS referencia_competencia TEXT,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS parcelamento TEXT,
  ADD COLUMN IF NOT EXISTS mes_competencia TEXT,
  ADD COLUMN IF NOT EXISTS data_pagamento DATE;
