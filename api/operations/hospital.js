export const config = { runtime: 'edge' }

export default function handler() {
  return new Response(JSON.stringify({ ok: false }), {
    status: 410,
    headers: { 'content-type': 'application/json' },
  })
}
