-- Otimização de consultas: criação de índices para chaves estrangeiras e campos de filtro (Melhoria Técnica)

-- Tabela: ocupacao_salas
CREATE INDEX IF NOT EXISTS idx_ocupacao_salas_sala_id ON public.ocupacao_salas(sala_id);
CREATE INDEX IF NOT EXISTS idx_ocupacao_salas_paciente_id ON public.ocupacao_salas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_ocupacao_salas_horario_inicio ON public.ocupacao_salas(horario_inicio);

-- Tabela: transacoes
CREATE INDEX IF NOT EXISTS idx_transacoes_paciente_id ON public.transacoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON public.transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON public.transacoes(tipo);

-- Tabela: registros_diarios
CREATE INDEX IF NOT EXISTS idx_registros_diarios_data ON public.registros_diarios(data);
CREATE INDEX IF NOT EXISTS idx_registros_diarios_autor_id ON public.registros_diarios(autor_id);

-- Tabela: despesas
CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON public.despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_status ON public.despesas(status);

-- Tabela: consultas
CREATE INDEX IF NOT EXISTS idx_consultas_gestante_id ON public.consultas(gestante_id);
CREATE INDEX IF NOT EXISTS idx_consultas_data_consulta ON public.consultas(data_consulta);
