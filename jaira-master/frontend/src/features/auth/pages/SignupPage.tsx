import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { extractApiError } from '@/lib/apiClient'
import { authApi } from '../api/authApi'
import { signupSchema } from '../schemas'
import type { SignupValues } from '../schemas'

export function SignupPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { gender: 'male' },
  })

  const onSubmit = async (values: SignupValues) => {
    setServerError(null)
    setSubmitting(true)
    try {
      await authApi.signup(values)
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`, {
        replace: true,
      })
    } catch (err) {
      setServerError(extractApiError(err, 'Signup failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500">Task Management System</p>
        </div>

        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            placeholder="010xxxxxxxx"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="Age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            error={errors.age?.message}
          />
        </div>
        <label className="flex flex-col gap-1 text-sm" htmlFor="gender">
          <span className="font-medium text-slate-700">Gender</span>
          <select
            id="gender"
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            {...register('gender')}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender?.message ? (
            <span className="text-xs text-red-600">{errors.gender.message}</span>
          ) : null}
        </label>
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label="Confirm password"
          type="password"
          {...register('confirmpassword')}
          error={errors.confirmpassword?.message}
        />

        {serverError ? (
          <p className="text-sm text-red-600">{serverError}</p>
        ) : null}

        <Button type="submit" className="w-full" loading={submitting}>
          Sign up
        </Button>

        <p className="text-center text-sm text-slate-600">
          Have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
