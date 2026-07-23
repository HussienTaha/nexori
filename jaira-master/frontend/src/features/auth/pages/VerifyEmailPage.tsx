import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { extractApiError } from '@/lib/apiClient'
import { authApi } from '../api/authApi'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      await authApi.verifyEmail({ email, otp })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(extractApiError(err, 'Email verification failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    setError(null)
    setMessage(null)
    setResending(true)
    try {
      const response = await authApi.resendVerification(email)
      setMessage(response.message ?? 'A new verification code was sent.')
    } catch (err) {
      setError(extractApiError(err, 'Could not resend the code'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={verify}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Verify email</h1>
          <p className="text-sm text-slate-500">
            Enter the six-digit code sent to your email address.
          </p>
        </div>

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]{6}"
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
          required
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        <Button type="submit" className="w-full" loading={submitting}>
          Verify email
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          loading={resending}
          onClick={resend}
          disabled={!email}
        >
          Resend code
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already verified?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
