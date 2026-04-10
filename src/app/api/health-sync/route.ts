import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Validate API key from Authorization header
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.HEALTH_SYNC_KEY

  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    // For now, just acknowledge the data
    // Full Supabase storage will be wired up when credentials are added
    console.log('Health sync received:', Object.keys(body))
    return NextResponse.json({ success: true, received: Object.keys(body) })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}
