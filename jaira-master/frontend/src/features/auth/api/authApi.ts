import { apiClient } from '@/lib/apiClient'
import type { LoginPayload, LoginResponse, SignupPayload } from '../types'

export const authApi = {
  signup(payload: SignupPayload) {
    return apiClient.post('/users/auth/signup', payload).then((r) => r.data)
  },
  login(payload: LoginPayload) {
    return apiClient
      .post<LoginResponse>('/users/auth/login', payload)
      .then((r) => r.data)
  },
  refresh() {
    return apiClient.post('/users/auth/refresh-token').then((r) => r.data)
  },
}
