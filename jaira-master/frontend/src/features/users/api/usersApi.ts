import { apiClient } from '@/lib/apiClient'
import type { User } from '../types'

export const usersApi = {
  list() {
    return apiClient
      .get<{ message: string; users: User[] }>('/users')
      .then((r) => r.data.users)
  },
  getOne(id: string) {
    return apiClient
      .get<{ message: string; user: User }>(`/users/${id}`)
      .then((r) => r.data.user)
  },
  updateProfile(payload: Partial<Pick<User, 'name' | 'age' | 'gender' | 'phone'>>) {
    return apiClient.patch('/users/me', payload).then((r) => r.data)
  },
  updateEmail(newEmail: string) {
    return apiClient.patch('/users/me/email', { newEmail }).then((r) => r.data)
  },
  deleteSelf() {
    return apiClient.delete('/users/me').then((r) => r.data)
  },
}
