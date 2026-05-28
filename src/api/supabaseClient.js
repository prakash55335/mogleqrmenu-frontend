import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://qkwvpflnrwtfufmlwpcx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrd3ZwZmxucnd0ZnVmbWx3cGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTQzMjQsImV4cCI6MjA4OTIzMDMyNH0.cmqG-Qn6TtQm-mWX29Foyz_olzmqWVMKnMG896q-ArE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)