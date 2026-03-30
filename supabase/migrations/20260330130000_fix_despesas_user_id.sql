-- Adiciona user_id se não existir para vincular as despesas aos usuários logados
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adiciona conta_pagamento se não existir
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS conta_pagamento TEXT DEFAULT 'Carnê Leão / Unicred';
