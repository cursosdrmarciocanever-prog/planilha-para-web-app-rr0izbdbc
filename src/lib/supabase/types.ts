// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      access_control: {
        Row: {
          created_at: string
          email: string
          gestante_id: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          gestante_id?: string | null
          id?: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          gestante_id?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_control_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          arquivo_pdf_url: string | null
          created_at: string
          data_consulta: string | null
          gestante_id: string | null
          id: string
          medica_nome: string | null
          observacoes: string | null
          proxima_consulta_agendada: string | null
        }
        Insert: {
          arquivo_pdf_url?: string | null
          created_at?: string
          data_consulta?: string | null
          gestante_id?: string | null
          id?: string
          medica_nome?: string | null
          observacoes?: string | null
          proxima_consulta_agendada?: string | null
        }
        Update: {
          arquivo_pdf_url?: string | null
          created_at?: string
          data_consulta?: string | null
          gestante_id?: string | null
          id?: string
          medica_nome?: string | null
          observacoes?: string | null
          proxima_consulta_agendada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
      exames_laboratoriais: {
        Row: {
          arquivo_pdf_url: string | null
          created_at: string
          data_exame: string | null
          gestante_id: string | null
          id: string
          resultado_resumo: string | null
          tipo_exame: string | null
        }
        Insert: {
          arquivo_pdf_url?: string | null
          created_at?: string
          data_exame?: string | null
          gestante_id?: string | null
          id?: string
          resultado_resumo?: string | null
          tipo_exame?: string | null
        }
        Update: {
          arquivo_pdf_url?: string | null
          created_at?: string
          data_exame?: string | null
          gestante_id?: string | null
          id?: string
          resultado_resumo?: string | null
          tipo_exame?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exames_laboratoriais_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
      fotos_timeline: {
        Row: {
          created_at: string
          data_foto: string | null
          descricao: string | null
          foto_url: string | null
          gestante_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          data_foto?: string | null
          descricao?: string | null
          foto_url?: string | null
          gestante_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          data_foto?: string | null
          descricao?: string | null
          foto_url?: string | null
          gestante_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_timeline_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
      gestantes: {
        Row: {
          alergias: string | null
          created_at: string
          data_nascimento: string | null
          data_ultima_menstruacao: string | null
          foto_perfil_url: string | null
          id: string
          medicamentos_em_uso: string | null
          nome: string
          tipo_sanguineo: string | null
          user_id: string | null
        }
        Insert: {
          alergias?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_ultima_menstruacao?: string | null
          foto_perfil_url?: string | null
          id?: string
          medicamentos_em_uso?: string | null
          nome: string
          tipo_sanguineo?: string | null
          user_id?: string | null
        }
        Update: {
          alergias?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_ultima_menstruacao?: string | null
          foto_perfil_url?: string | null
          id?: string
          medicamentos_em_uso?: string | null
          nome?: string
          tipo_sanguineo?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medicamentos: {
        Row: {
          created_at: string
          data_inicio: string | null
          dosagem: string | null
          gestante_id: string | null
          id: string
          nome_medicamento: string | null
        }
        Insert: {
          created_at?: string
          data_inicio?: string | null
          dosagem?: string | null
          gestante_id?: string | null
          id?: string
          nome_medicamento?: string | null
        }
        Update: {
          created_at?: string
          data_inicio?: string | null
          dosagem?: string | null
          gestante_id?: string | null
          id?: string
          nome_medicamento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicamentos_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      sintomas_observacoes: {
        Row: {
          created_at: string
          data_registro: string | null
          descricao: string | null
          gestante_id: string | null
          id: string
          tipo_sintoma: string | null
        }
        Insert: {
          created_at?: string
          data_registro?: string | null
          descricao?: string | null
          gestante_id?: string | null
          id?: string
          tipo_sintoma?: string | null
        }
        Update: {
          created_at?: string
          data_registro?: string | null
          descricao?: string | null
          gestante_id?: string | null
          id?: string
          tipo_sintoma?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sintomas_observacoes_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
      suplementos: {
        Row: {
          created_at: string
          data_inicio: string | null
          dosagem: string | null
          gestante_id: string | null
          id: string
          nome_suplemento: string
          observacoes: string | null
        }
        Insert: {
          created_at?: string
          data_inicio?: string | null
          dosagem?: string | null
          gestante_id?: string | null
          id?: string
          nome_suplemento: string
          observacoes?: string | null
        }
        Update: {
          created_at?: string
          data_inicio?: string | null
          dosagem?: string | null
          gestante_id?: string | null
          id?: string
          nome_suplemento?: string
          observacoes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suplementos_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
      ultrassons: {
        Row: {
          arquivo_pdf_url: string | null
          created_at: string
          data_ultrassom: string | null
          gestante_id: string | null
          id: string
          observacoes_medica: string | null
          semana_gestacional: number | null
        }
        Insert: {
          arquivo_pdf_url?: string | null
          created_at?: string
          data_ultrassom?: string | null
          gestante_id?: string | null
          id?: string
          observacoes_medica?: string | null
          semana_gestacional?: number | null
        }
        Update: {
          arquivo_pdf_url?: string | null
          created_at?: string
          data_ultrassom?: string | null
          gestante_id?: string | null
          id?: string
          observacoes_medica?: string | null
          semana_gestacional?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ultrassons_gestante_id_fkey"
            columns: ["gestante_id"]
            isOneToOne: false
            referencedRelation: "gestantes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
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
// Table: access_control
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   email: text (not null)
//   role: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: consultas
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   data_consulta: date (nullable)
//   medica_nome: text (nullable)
//   observacoes: text (nullable)
//   arquivo_pdf_url: text (nullable)
//   proxima_consulta_agendada: timestamp without time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: exames_laboratoriais
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   data_exame: date (nullable)
//   tipo_exame: text (nullable)
//   resultado_resumo: text (nullable)
//   arquivo_pdf_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: fotos_timeline
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   data_foto: date (nullable)
//   descricao: text (nullable)
//   foto_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: gestantes
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   nome: text (not null)
//   data_nascimento: date (nullable)
//   tipo_sanguineo: text (nullable)
//   alergias: text (nullable)
//   medicamentos_em_uso: text (nullable)
//   data_ultima_menstruacao: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   foto_perfil_url: text (nullable)
// Table: medicamentos
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   data_inicio: date (nullable)
//   nome_medicamento: text (nullable)
//   dosagem: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   role: text (not null, default: 'gestante'::text)
//   full_name: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   avatar_url: text (nullable)
// Table: sintomas_observacoes
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   data_registro: date (nullable)
//   tipo_sintoma: text (nullable)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: suplementos
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   nome_suplemento: text (not null)
//   dosagem: text (nullable)
//   data_inicio: date (nullable)
//   observacoes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: ultrassons
//   id: uuid (not null, default: gen_random_uuid())
//   gestante_id: uuid (nullable)
//   data_ultrassom: date (nullable)
//   observacoes_medica: text (nullable)
//   arquivo_pdf_url: text (nullable)
//   semana_gestacional: integer (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: access_control
//   UNIQUE access_control_gestante_id_email_key: UNIQUE (gestante_id, email)
//   FOREIGN KEY access_control_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY access_control_pkey: PRIMARY KEY (id)
//   CHECK access_control_role_check: CHECK ((role = ANY (ARRAY['medica'::text, 'familiar'::text])))
// Table: consultas
//   FOREIGN KEY consultas_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY consultas_pkey: PRIMARY KEY (id)
// Table: exames_laboratoriais
//   FOREIGN KEY exames_laboratoriais_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY exames_laboratoriais_pkey: PRIMARY KEY (id)
// Table: fotos_timeline
//   FOREIGN KEY fotos_timeline_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY fotos_timeline_pkey: PRIMARY KEY (id)
// Table: gestantes
//   PRIMARY KEY gestantes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY gestantes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE gestantes_user_id_key: UNIQUE (user_id)
// Table: medicamentos
//   FOREIGN KEY medicamentos_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY medicamentos_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_role_check: CHECK ((role = ANY (ARRAY['gestante'::text, 'medica'::text, 'familiar'::text, 'admin'::text])))
// Table: sintomas_observacoes
//   FOREIGN KEY sintomas_observacoes_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY sintomas_observacoes_pkey: PRIMARY KEY (id)
// Table: suplementos
//   FOREIGN KEY suplementos_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY suplementos_pkey: PRIMARY KEY (id)
// Table: ultrassons
//   FOREIGN KEY ultrassons_gestante_id_fkey: FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
//   PRIMARY KEY ultrassons_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: access_control
//   Policy "Gestante manage access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = access_control.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited view access" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (email = (auth.jwt() ->> 'email'::text))
// Table: consultas
//   Policy "Gestante ALL consultas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = consultas.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited SELECT consultas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = consultas.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
//   Policy "Medica INSERT consultas" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = consultas.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
//   Policy "Medica UPDATE consultas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = consultas.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
// Table: exames_laboratoriais
//   Policy "Gestante ALL exames_laboratoriais" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = exames_laboratoriais.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited SELECT exames_laboratoriais" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = exames_laboratoriais.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
//   Policy "Medica INSERT exames_laboratoriais" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = exames_laboratoriais.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
//   Policy "Medica UPDATE exames_laboratoriais" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = exames_laboratoriais.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
// Table: fotos_timeline
//   Policy "Gestante ALL fotos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = fotos_timeline.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited SELECT fotos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = fotos_timeline.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
// Table: gestantes
//   Policy "Gestante access own" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited view gestante" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = ac.id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
// Table: medicamentos
//   Policy "Gestante ALL medicamentos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = medicamentos.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited SELECT medicamentos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = medicamentos.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
//   Policy "Medica INSERT medicamentos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = medicamentos.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
//   Policy "Medica UPDATE medicamentos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = medicamentos.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
// Table: profiles
//   Policy "Users update own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = id) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Users view own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = id) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
// Table: sintomas_observacoes
//   Policy "Gestante ALL sintomas_observacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = sintomas_observacoes.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited SELECT sintomas_observacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = sintomas_observacoes.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
//   Policy "Medica INSERT sintomas_observacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = sintomas_observacoes.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
//   Policy "Medica UPDATE sintomas_observacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = sintomas_observacoes.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
// Table: suplementos
//   Policy "Gestante ALL suplementos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = suplementos.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited SELECT suplementos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = suplementos.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
//   Policy "Medica INSERT suplementos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = suplementos.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
//   Policy "Medica UPDATE suplementos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = suplementos.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
// Table: ultrassons
//   Policy "Gestante ALL ultrassons" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM gestantes g   WHERE ((g.id = ultrassons.gestante_id) AND (g.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text)))))
//   Policy "Invited SELECT ultrassons" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = ultrassons.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)))))
//   Policy "Medica INSERT ultrassons" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = ultrassons.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))
//   Policy "Medica UPDATE ultrassons" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM access_control ac   WHERE ((ac.gestante_id = ultrassons.gestante_id) AND (ac.email = (auth.jwt() ->> 'email'::text)) AND (ac.role = 'medica'::text))))

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, full_name, role)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       NEW.raw_user_meta_data->>'nome',
//       'gestante'
//     );
//     RETURN NEW;
//   END;
//   $function$
//   

// --- INDEXES ---
// Table: access_control
//   CREATE UNIQUE INDEX access_control_gestante_id_email_key ON public.access_control USING btree (gestante_id, email)
// Table: gestantes
//   CREATE UNIQUE INDEX gestantes_user_id_key ON public.gestantes USING btree (user_id)

