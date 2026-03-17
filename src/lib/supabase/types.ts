// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4'
  }
  public: {
    Tables: {
      'banco de dados': {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string | null
          crm_id: string | null
          dados: Json | null
          email: string | null
          follow_up: boolean | null
          humano: boolean | null
          nome: string | null
          numero: string
          ultima_msg: string | null
        }
        Insert: {
          created_at?: string | null
          crm_id?: string | null
          dados?: Json | null
          email?: string | null
          follow_up?: boolean | null
          humano?: boolean | null
          nome?: string | null
          numero: string
          ultima_msg?: string | null
        }
        Update: {
          created_at?: string | null
          crm_id?: string | null
          dados?: Json | null
          email?: string | null
          follow_up?: boolean | null
          humano?: boolean | null
          nome?: string | null
          numero?: string
          ultima_msg?: string | null
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          id: number
          tipo: Database['public']['Enums']['tipo_despesa']
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: never
          tipo: Database['public']['Enums']['tipo_despesa']
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: never
          tipo?: Database['public']['Enums']['tipo_despesa']
          valor?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      n8n_chat: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      produtos_servicos: {
        Row: {
          categoria: string | null
          created_at: string
          custo: number | null
          descricao: string | null
          id: number
          nome: string
          preco_venda: number | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          custo?: number | null
          descricao?: string | null
          id?: never
          nome: string
          preco_venda?: number | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          custo?: number | null
          descricao?: string | null
          id?: never
          nome?: string
          preco_venda?: number | null
        }
        Relationships: []
      }
      registros_diarios: {
        Row: {
          bilheteria: number | null
          created_at: string
          data: string
          faturamento_total: number | null
          id: number
          total_consultas: number | null
          total_servicos: number | null
        }
        Insert: {
          bilheteria?: number | null
          created_at?: string
          data: string
          faturamento_total?: number | null
          id?: never
          total_consultas?: number | null
          total_servicos?: number | null
        }
        Update: {
          bilheteria?: number | null
          created_at?: string
          data?: string
          faturamento_total?: number | null
          id?: never
          total_consultas?: number | null
          total_servicos?: number | null
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          id: number
          paciente_id: string | null
          produto_id: number | null
          tipo: Database['public']['Enums']['tipo_transacao']
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: never
          paciente_id?: string | null
          produto_id?: number | null
          tipo: Database['public']['Enums']['tipo_transacao']
          valor: number
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: never
          paciente_id?: string | null
          produto_id?: number | null
          tipo?: Database['public']['Enums']['tipo_transacao']
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'transacoes_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transacoes_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produtos_servicos'
            referencedColumns: ['id']
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      tipo_despesa: 'fixa' | 'variável'
      tipo_transacao: 'entrada' | 'saída'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      tipo_despesa: ['fixa', 'variável'],
      tipo_transacao: ['entrada', 'saída'],
    },
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: banco de dados
//   id: bigint (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: clientes
//   numero: character varying (not null)
//   nome: character varying (nullable)
//   email: character varying (nullable)
//   dados: jsonb (nullable)
//   humano: boolean (nullable, default: false)
//   crm_id: character varying (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   ultima_msg: text (nullable)
//   follow_up: boolean (nullable)
// Table: despesas
//   id: bigint (not null)
//   tipo: tipo_despesa (not null)
//   descricao: text (not null)
//   valor: numeric (not null)
//   data: date (not null)
//   categoria: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: documents
//   id: bigint (not null, default: nextval('documents_id_seq'::regclass))
//   content: text (nullable)
//   metadata: jsonb (nullable)
//   embedding: vector (nullable)
// Table: n8n_chat
//   id: integer (not null, default: nextval('n8n_chat_id_seq'::regclass))
//   session_id: character varying (not null)
//   message: jsonb (not null)
// Table: pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   cpf: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   data_nascimento: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: produtos_servicos
//   id: bigint (not null)
//   nome: text (not null)
//   descricao: text (nullable)
//   custo: numeric (nullable, default: 0)
//   preco_venda: numeric (nullable, default: 0)
//   categoria: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: registros_diarios
//   id: bigint (not null)
//   data: date (not null)
//   faturamento_total: numeric (nullable, default: 0)
//   total_consultas: integer (nullable, default: 0)
//   total_servicos: integer (nullable, default: 0)
//   bilheteria: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: transacoes
//   id: bigint (not null)
//   tipo: tipo_transacao (not null)
//   descricao: text (nullable)
//   valor: numeric (not null)
//   data: timestamp with time zone (not null, default: now())
//   paciente_id: uuid (nullable)
//   produto_id: bigint (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: usuarios
//   id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   role: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: banco de dados
//   PRIMARY KEY banco de dados_pkey: PRIMARY KEY (id)
// Table: clientes
//   PRIMARY KEY clientes_pkey: PRIMARY KEY (numero)
// Table: despesas
//   PRIMARY KEY despesas_pkey: PRIMARY KEY (id)
// Table: documents
//   PRIMARY KEY documents_pkey: PRIMARY KEY (id)
// Table: n8n_chat
//   PRIMARY KEY n8n_chat_pkey: PRIMARY KEY (id)
// Table: pacientes
//   UNIQUE pacientes_cpf_key: UNIQUE (cpf)
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
// Table: produtos_servicos
//   PRIMARY KEY produtos_servicos_pkey: PRIMARY KEY (id)
// Table: registros_diarios
//   UNIQUE registros_diarios_data_key: UNIQUE (data)
//   PRIMARY KEY registros_diarios_pkey: PRIMARY KEY (id)
// Table: transacoes
//   FOREIGN KEY transacoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
//   PRIMARY KEY transacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transacoes_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos_servicos(id) ON DELETE SET NULL
// Table: usuarios
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: banco de dados
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clientes
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: despesas
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documents
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: n8n_chat
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pacientes
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: produtos_servicos
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: registros_diarios
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: transacoes
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: usuarios
//   Policy "Allow authenticated users full access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION match_documents(vector, integer, jsonb)
//   CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
//    RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
//    LANGUAGE plpgsql
//   AS $function$
//   #variable_conflict use_column
//   begin
//     return query
//     select
//       id,
//       content,
//       metadata,
//       1 - (documents.embedding <=> query_embedding) as similarity
//     from documents
//     where metadata @> filter
//     order by documents.embedding <=> query_embedding
//     limit match_count;
//   end;
//   $function$
//

// --- INDEXES ---
// Table: pacientes
//   CREATE UNIQUE INDEX pacientes_cpf_key ON public.pacientes USING btree (cpf)
// Table: registros_diarios
//   CREATE UNIQUE INDEX registros_diarios_data_key ON public.registros_diarios USING btree (data)
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
