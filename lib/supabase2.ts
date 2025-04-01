import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const providerSupabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL2,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY2,
  })

  export const supabase2 = providerSupabase