import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/useAuth'
import { useLogin } from '@/hooks'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { loginSchema, type LoginFormData } from './loginSchema'
import styles from './LoginPage.module.scss'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const loginMutation = useLogin()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    setError(null)
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        login(response.token)
        navigate('/dashboard', { replace: true })
      },
      onError: (err) => {
        setError(
          (err as { message?: string }).message || 'Something went wrong',
        )
      },
    })
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome!</h1>
      <p className={styles.subtitle}>Enter details to login.</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        noValidate
      >
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <Input
          type="email"
          placeholder="Email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <a href="#" className={styles.forgotLink}>
          FORGOT PASSWORD?
        </a>

        <Button
          type="submit"
          size="lg"
          loading={loginMutation.isPending}
          className={styles.submitButton}
        >
          LOG IN
        </Button>
      </form>
    </div>
  )
}

export default LoginPage
