CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id uuid;
  v_fin_id uuid;
BEGIN
  -- Handle admin@canever.com.br
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@canever.com.br';
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'admin@canever.com.br',
      crypt('Senha123!', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Dr. Márcio"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('Senha123!', gen_salt('bf')) WHERE id = v_admin_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (v_admin_id, 'admin@canever.com.br', 'Dr. Márcio', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Dr. Márcio';

  -- Handle financeiro@canever.com.br
  SELECT id INTO v_fin_id FROM auth.users WHERE email = 'financeiro@canever.com.br';
  IF v_fin_id IS NULL THEN
    v_fin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_fin_id, '00000000-0000-0000-0000-000000000000', 'financeiro@canever.com.br',
      crypt('Senha123!', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Responsável Financeiro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('Senha123!', gen_salt('bf')) WHERE id = v_fin_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (v_fin_id, 'financeiro@canever.com.br', 'Responsável Financeiro', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Responsável Financeiro';

END $$;
