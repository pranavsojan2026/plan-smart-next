import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client for users (using first project)
export const userSupabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

// Client for providers (using second project)


// If you need backwards compatibility, you can also export a default client
export const supabase = userSupabase 
// This will help with existing code that uses the default import