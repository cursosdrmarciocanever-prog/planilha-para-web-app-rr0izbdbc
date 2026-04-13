-- Adiciona colunas para suportar a carga de dados em massa (Categoria, Status e Vínculo de Usuário)
ALTER TABLE public.medicamentos_precificacao 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Insere os 64 medicamentos com tratamento de idempotência
DO $$
DECLARE
    v_admin_id uuid;
BEGIN
    -- Identifica um administrador ou o primeiro usuário criado para vincular os registros
    SELECT id INTO v_admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

    INSERT INTO public.medicamentos_precificacao 
        (nome, categoria, custo_aquisicao, impostos, margem_lucro, preco_venda_sugerido, preco_venda_final, ativo, user_id)
    SELECT * FROM (
        VALUES 
            ('ÁCIDO ALFA LIPÓICO (3%) 300mg/10mL', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('ACIDO FÓLICO (0,5%) 10mg/2ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('ADEK2 VIT A 20.000ui/VIT D3 100.000ui/VIT E 100mg/VIT K2 1000mg', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA FERTILIDADE FEMININA', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('ADJUVANTE LIPEDEMA', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('AMINOACIDOS 3,8%/10ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('ADJUVANTE PARA ENXAQUECA', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('ANASTROZOL (0,1%) 1mg/1ml', 'Hormônios', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('ATP (ADENOSINA TRIFOSFATO) 20mg/2ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA SAUDE DOS CABELOS DA PELE E DAS UNHAS', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('CITRUS SINESIS L. OSBECK MORO 2% 20MG/1ML', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('COMPLEXO B SEM B1/2ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('CLORIDRATO METOCLOPRAMIDA (PLASIL) 10mg/2ml', 'Anestésicos e Diuréticos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('COENZIMA Q10 (5%) 100MG/2ML', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('CIPIONATO DE TESTOSTERONA (DEPOSTERON) 200mg/2ml', 'Hormônios', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('DECA-DURABOLIN (DECANOATO DE NANDROLONA)', 'Hormônios', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('DMSO 99%/5ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('DURATESTON 250mg/IM AMPOLAS DE 1ML', 'Hormônios', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('D-RIBOSE (25%) 500MG/2ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('DEXAMETASONA 4MG/ML 2,5ML', 'Anestésicos e Diuréticos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('EDTA CALCIO 750mg/5ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA FADIGA/INDISPOSIÇÃO', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('CITRUS SINENSIS COMPLEX COM TEACRINA/2,5ML', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('FUROSEMIDA 20mg/2ml', 'Anestésicos e Diuréticos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA ESTEATOSE E COMPLICAÇÕES HEPÁTICAS', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('HORMUS (UNDECILATO DE TESTOSTERONA) 250MG/ML 4ML', 'Hormônios', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('LIDOCAINA CLORIDRATO (2%) 20MG/1ml', 'Anestésicos e Diuréticos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('L-CARNITINA (30%) 600MG/2ML', 'Emagrecedores', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('L-GLUTATHION (12%) 600MG/5ML', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('L-GLUTATHION (5%) 100MG/2ML', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('METILADORES METILFOLATO 2,50mg/2ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('METILFOLATO (0,125%) 2,5mg/2ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('MSM (METILSULFONILMETANO) (15%) 1,5G/10ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('NAC (N-ACETIL CISTEINA) (15%) 300mg/2ml', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('NAD+NADH (0,5%) 10mg/2ml', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('NANOMICELAS DE CURCUMINOIDES (0,15%) 2mg/2ml', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('NANOMICELAS DE RESVERATROL (1%) 10mg/1ml', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('NMN (MONONUCLEIDEO DE NICOTINAMIDA)', 'Antioxidantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('NORIPORUM 100mg/5ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA REPOSIÇÃO DE NUTRIENTES DIETA HCG', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('POOL DE MINERAIS 2ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('REDUÇÃO DE HOMOCISTEÍNA (SORO)', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('SINDROME DE BURNOUT', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('SULFATO DE MAGNESIO (10%) 200mg/2ml', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('VITAMINA B3 (NICOTINAMIDA) (1,5%) 30MG/2ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('VITAMINA B12 (METILCOBALAMINA) (0,05%) 500MCG/1ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('VITAMINA B12 (METILCOBALAMINA) (0,25%) 2500MCG/1ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('VITAMINA C (ÁCIDO ASCÓRBICO) (40%) 10g/25ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('VITAMINA D3 (COLECALCIFEROL) 50.000UI/1ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('VITAMINA D3 (COLECALCIFEROL) 600.000UI/1ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA REDUÇÃO DA LIPOPROTEÍNA A', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA REGULAÇÃO DO SONO', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PROTOCOLO ADJUVANTE PARA SOP SÍNDROME DOS OVÁRIOS POLICÍSTICOS', 'Protocolos Adjuvantes', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('VITAMINA D3 50.000 UI/1ML', 'Vitaminas e Suplementos', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('BLEND (SEMAGLUTIDA) 2,4mg/ml-4ml', 'Emagrecedores', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('TIRZEPATIDA 90MG', 'Emagrecedores', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('TIRZEPATIDA 10MG', 'Emagrecedores', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('GESTRINONA 40mg', 'Pellets Hormonais', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('TESTOSTERONA 40mg', 'Pellets Hormonais', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('ESTRADIOL 50mg', 'Pellets Hormonais', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('NESTORONE 50mg', 'Pellets Hormonais', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('OXANDROLONA 40mg', 'Pellets Hormonais', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PELLETS TESTO 100MG', 'Pellets Hormonais', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id),
            ('PELLETS TESTO 200MG', 'Pellets Hormonais', 0.0, 6.0, 50.0, 0.0, 0.0, true, v_admin_id)
    ) AS tmp (nome, categoria, custo_aquisicao, impostos, margem_lucro, preco_venda_sugerido, preco_venda_final, ativo, user_id)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.medicamentos_precificacao mp WHERE mp.nome = tmp.nome
    );
END $$;
