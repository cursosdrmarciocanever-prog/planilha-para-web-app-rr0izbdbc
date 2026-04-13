DO $$
DECLARE
  paciente1_id UUID;
  produto1_id BIGINT;
  produto2_id BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pacientes LIMIT 1) THEN
    paciente1_id := gen_random_uuid();
    INSERT INTO public.pacientes (id, nome, cpf, telefone, email)
    VALUES (paciente1_id, 'João Silva', '12345678901', '11999999999', 'joao@example.com');
    
    INSERT INTO public.produtos_servicos (nome, descricao, custo, preco_venda, categoria)
    VALUES ('Consulta Inicial', 'Consulta de avaliação', 0, 150.00, 'consulta')
    RETURNING id INTO produto1_id;

    INSERT INTO public.produtos_servicos (nome, descricao, custo, preco_venda, categoria)
    VALUES ('Ingresso Evento', 'Entrada para o workshop', 0, 50.00, 'bilheteria')
    RETURNING id INTO produto2_id;

    INSERT INTO public.transacoes (tipo, descricao, valor, data, paciente_id, produto_id)
    VALUES 
      ('entrada', 'Pagamento Consulta', 150.00, NOW() - INTERVAL '2 days', paciente1_id, produto1_id),
      ('entrada', 'Compra Ingresso', 50.00, NOW(), paciente1_id, produto2_id);

    INSERT INTO public.despesas (tipo, descricao, valor, data, categoria)
    VALUES 
      ('variável', 'Material escritório', 100.00, CURRENT_DATE, 'materiais');
  END IF;
END $$;
