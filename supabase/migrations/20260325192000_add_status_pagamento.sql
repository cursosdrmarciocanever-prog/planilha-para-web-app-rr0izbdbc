ALTER TABLE public.lancamentos_pacientes
ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'Confirmado';
