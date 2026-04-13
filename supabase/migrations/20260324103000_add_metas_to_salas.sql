-- Migration: Add metas to salas table
ALTER TABLE public.salas ADD COLUMN IF NOT EXISTS meta_faturamento NUMERIC DEFAULT 0;
ALTER TABLE public.salas ADD COLUMN IF NOT EXISTS meta_horas NUMERIC DEFAULT 0;
