import { describe, expect, it } from 'vitest'

import { middleware } from '../middleware'

describe('middleware', () => {
  it('allows analytics script requests without redirecting to login', async () => {
    const request = {
      nextUrl: { pathname: '/_vercel/insights/script.js', search: '' },
      method: 'GET',
      headers: new Headers(),
      cookies: { get: () => undefined },
      url: 'https://fuxem.com/_vercel/insights/script.js',
    } as any

    const response = await middleware(request)

    expect(response.status).toBe(200)
  })
})
