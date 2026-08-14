import { NextRequest, NextResponse } from 'next/server'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { s3Client } from '@/lib/s3'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { itemId } = await request.json()

  const key = `${user.id}/${itemId}/${Date.now()}.jpg`

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Conditions: [
      ['content-length-range', 0, 10485760], // max 10MB
      ['starts-with', '$Content-Type', 'image/'],
    ],
    Expires: 60, // seconds
  })

  return NextResponse.json({ url, fields, key })
}