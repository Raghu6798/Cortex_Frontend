'use client'

import { SignIn } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (isSignedIn) {
    return null 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              card: 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
              headerTitle: 'text-black font-black text-2xl',
              headerSubtitle: 'text-black font-bold',
              formButtonPrimary: 'bg-yellow-400 border-2 border-black text-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]',
              socialButtonsBlockButton: 'bg-white border-2 border-black text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]',
              formFieldInput: 'bg-white border-2 border-black text-black font-bold',
              formFieldLabel: 'text-black font-bold',
              footerActionLink: 'text-black font-bold hover:underline',
              identityPreviewText: 'text-black font-bold',
              formFieldSuccessText: 'text-green-600 font-bold',
              formFieldErrorText: 'text-red-600 font-bold',
            }
          }}
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}