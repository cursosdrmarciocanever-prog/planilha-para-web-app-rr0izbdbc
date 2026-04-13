import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // Uses SERVICE_ROLE_KEY to bypass RLS for inserting system logs, or falls back to ANON_KEY
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente ausentes. Verifique as configurações do Supabase.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await req.json()
    const { funcao, status, mensagem_erro, usuario_id } = body

    if (!funcao || !status) {
      throw new Error("Parâmetros 'funcao' e 'status' são obrigatórios.")
    }

    const validStatuses = ['sucesso', 'erro', 'pendente']
    if (!validStatuses.includes(status)) {
      throw new Error(`O status deve ser um dos seguintes: ${validStatuses.join(', ')}`)
    }

    const { data, error } = await supabase
      .from('logs_automacao')
      .insert({
        funcao,
        status,
        mensagem_erro: mensagem_erro || null,
        usuario_id: usuario_id || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao registrar log no banco de dados: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Log registrado com sucesso.',
        data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
