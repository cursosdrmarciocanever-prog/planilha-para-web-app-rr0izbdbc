CREATE TABLE public.salas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    taxa_hora NUMERIC(10,2) DEFAULT 0,
    taxa_dia NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ocupacao_salas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    sala_id BIGINT REFERENCES public.salas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    valor_cobrado NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocupacao_salas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access on salas" ON public.salas 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access on ocupacao_salas" ON public.ocupacao_salas 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Data
DO $$
DECLARE
  v_sala1_id BIGINT;
  v_sala2_id BIGINT;
BEGIN
  INSERT INTO public.salas (nome, taxa_hora, taxa_dia) VALUES ('Consultório 1', 100.00, 500.00) RETURNING id INTO v_sala1_id;
  INSERT INTO public.salas (nome, taxa_hora, taxa_dia) VALUES ('Consultório 2', 150.00, 800.00) RETURNING id INTO v_sala2_id;
  INSERT INTO public.salas (nome, taxa_hora, taxa_dia) VALUES ('Sala de Procedimentos', 250.00, 1500.00);
  
  INSERT INTO public.ocupacao_salas (sala_id, data_inicio, data_fim, valor_cobrado) VALUES
  (v_sala1_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', 200.00),
  (v_sala2_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '4 hours', 600.00);
END $$;
