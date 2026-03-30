ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS conta_pagamento TEXT DEFAULT 'Carnê Leão / Unicred';
ALTER TABLE public.contas_fixas ADD COLUMN IF NOT EXISTS conta_pagamento TEXT DEFAULT 'Carnê Leão / Unicred';
