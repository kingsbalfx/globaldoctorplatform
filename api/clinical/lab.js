export const config = { runtime: 'edge' }

export default function handler() {
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'content-type': 'application/json' },
  })
}
