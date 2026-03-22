'use server'

import { cookies } from 'next/headers'

export async function login(passcode: string) {
  if (passcode === process.env.APP_PASSCODE) {
    const cookieStore = await cookies()
    cookieStore.set('signal_auth', 'true', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    return { success: true }
  }
  return { success: false, error: 'Incorrect passcode' }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('signal_auth')
}
