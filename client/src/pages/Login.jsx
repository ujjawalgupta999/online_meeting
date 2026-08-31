import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

const Login = ({ mode = 'login' }) => {
  const { isLoaded, isSignedIn } = useUser()
  const isRegister = mode === 'register'

  // If already logged in, redirect to dashboard
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Image / Pattern omitted for brevity */}
      <div className="relative z-10 w-full flex justify-center py-12">
        {isRegister ? (
          <SignUp routing="path" path="/register" signInUrl="/login" fallbackRedirectUrl="/dashboard" />
        ) : (
          <SignIn routing="path" path="/login" signUpUrl="/register" fallbackRedirectUrl="/dashboard" />
        )}
      </div>
    </div>
  )
}

export default Login