import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Usuario = Database['public']['Tables']['usuarios']['Row']

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Usuario | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Usuario | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoadingSession(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoadingSession(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let mounted = true
    if (user) {
      setLoadingProfile(true)
      supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (mounted) {
            if (!error && data) {
              setProfile(data)
            } else {
              setProfile(null)
            }
            setLoadingProfile(false)
          }
        })
    } else {
      setProfile(null)
      setLoadingProfile(false)
    }
    return () => {
      mounted = false
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const loading = loadingSession || loadingProfile

  return (
    <AuthContext.Provider value={{ user, session, profile, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
