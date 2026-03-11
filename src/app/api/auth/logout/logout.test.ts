import { describe, it, expect } from 'vitest'
import { POST } from './route'

describe('POST /api/auth/logout', () => {

    it('debe retornar ok: true', async () => {
        const response = await POST()
        const data = await response.json()
        expect(data.ok).toBe(true)
    })

    it('debe retornar status 200', async () => {
        const response = await POST()
        expect(response.status).toBe(200)
    })

    it('debe eliminar la cookie auth-token', async () => {
        const response = await POST()
        const cookie = response.headers.get('set-cookie')
        expect(cookie).toContain('auth-token')
        expect(cookie).toContain('Max-Age=0')
    })

})