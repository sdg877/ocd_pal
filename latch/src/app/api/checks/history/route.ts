import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPhotoUrl } from '@/lib/getPhotoUrl'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: checks, error } = await supabase
    .from('checks')
    .select('id, photo_url, checked_at, item_id, checklist_items(name)')
    .eq('user_id', user.id)
    .order('checked_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const withUrls = await Promise.all(
    checks.map(async (check) => ({
      ...check,
      signedUrl: await getPhotoUrl(check.photo_url),
    }))
  )

  return NextResponse.json({ checks: withUrls })
}