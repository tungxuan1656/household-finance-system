import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

type FirebaseStorageConfig = {
  apiKey: string
  appId: string
  authDomain: string
  projectId: string
  storageBucket: string
}

const readFirebaseStorageConfig = (): FirebaseStorageConfig => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }

  if (
    !config.apiKey ||
    !config.appId ||
    !config.authDomain ||
    !config.projectId ||
    !config.storageBucket
  ) {
    throw new Error(
      'Missing Firebase storage config. Set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_APP_ID, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.',
    )
  }

  return config as FirebaseStorageConfig
}

let firebaseApp: FirebaseApp | null = null

const getFirebaseApp = () => {
  if (firebaseApp) {
    return firebaseApp
  }

  const config = readFirebaseStorageConfig()

  firebaseApp =
    getApps().find((app) => app.name === '[DEFAULT]') ?? initializeApp(config)

  return firebaseApp
}

const resolveStoragePath = (userId: string) => {
  const randomSuffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}`

  return `avatars/${userId}/${Date.now()}-${randomSuffix}.jpg`
}

export const uploadProfileAvatar = async (input: {
  file: Blob
  userId: string
}) => {
  const config = readFirebaseStorageConfig()
  const storage = getStorage(getFirebaseApp(), `gs://${config.storageBucket}`)
  const objectPath = resolveStoragePath(input.userId)

  const objectRef = ref(storage, objectPath)

  await uploadBytes(objectRef, input.file, {
    cacheControl: 'public, max-age=3600',
    contentType: 'image/jpeg',
  })

  return getDownloadURL(objectRef)
}
