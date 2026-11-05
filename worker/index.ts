interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

/**
 * The first version is a static frontend.
 * Keep the Worker entrypoint in place so API routes can be added later
 * without changing the Cloudflare deployment model.
 */
export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request)
  },
}
