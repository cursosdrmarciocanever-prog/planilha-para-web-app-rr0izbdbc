import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  avatar_url?: string | null
  created_at?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
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
  const [profile, setProfile] = useState<Profile | null>(null)
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

    // Auto refresh session every 30 minutes to prevent unexpected logouts
    const refreshInterval = setInterval(
      () => {
        supabase.auth.refreshSession()
      },
      30 * 60 * 1000,
    )

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    if (user) {
      setLoadingProfile(true)
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (mounted) {
            if (!error && data) {
              setProfile(data as Profile)
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
