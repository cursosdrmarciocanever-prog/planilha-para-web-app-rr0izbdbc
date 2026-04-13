CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  financeiro_id uuid := gen_random_uuid();
BEGIN
  -- User 1: Admin
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'admin@canever.com.br',
    crypt('Senha123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Dr. Márcio"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  INSERT INTO public.usuarios (id, email, nome, role, created_at)
  VALUES (admin_id, 'admin@canever.com.br', 'Dr. Márcio', 'admin', NOW());

  -- User 2: Financeiro
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    financeiro_id, '00000000-0000-0000-0000-000000000000', 'financeiro@canever.com.br',
    crypt('Senha123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Responsável Financeiro"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  INSERT INTO public.usuarios (id, email, nome, role, created_at)
  VALUES (financeiro_id, 'financeiro@canever.com.br', 'Responsável Financeiro', 'financeiro', NOW());
END $$;

-- Fix missing RLS policies to allow authenticated users full access
ALTER TABLE public."banco de dados" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public."banco de dados";
CREATE POLICY "Allow authenticated users full access" ON public."banco de dados" 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.clientes;
CREATE POLICY "Allow authenticated users full access" ON public.clientes 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.documents;
CREATE POLICY "Allow authenticated users full access" ON public.documents 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.n8n_chat ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.n8n_chat;
CREATE POLICY "Allow authenticated users full access" ON public.n8n_chat 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
