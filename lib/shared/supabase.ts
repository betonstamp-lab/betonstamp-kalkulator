import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Típusok a felhasználói profilhoz
export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string
  is_company: boolean
  company_name?: string
  tax_number?: string
  postal_code?: string
  city?: string
  address?: string
  role: 'customer' | 'partner'
  partner_discount?: number
  created_at: string
  updated_at: string
}