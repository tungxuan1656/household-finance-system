/**
 * Seed script authentication
 */

import { signInWithFirebaseEmailPassword, getFirebaseIdToken } from '../../../../src/lib/auth/firebase-auth'
import { API_ENDPOINTS } from '../../../../src/api/endpoints'
import { API_BASE, TEST_EMAIL, TEST_PASSWORD, accessToken, setAccessToken } from './types'

export async function authenticate(): Promise<void> {
  console.log('🔐 Authenticating...')
  try {
    const credential = await signInWithFirebaseEmailPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    const idToken = await getFirebaseIdToken(credential.user)
    const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.providerExchange}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, provider: 'firebase' }),
    })
    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status} ${await response.text()}`)
    }
    const data = await response.json()
    setAccessToken(data.accessToken)
    console.log('✅ Authenticated successfully')
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    throw error
  }
}