// Public form endpoint. Secrets remain in Supabase's server environment.
const origin = 'https://nohsj8-design.github.io';
const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'content-type, apikey', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const reply = (status: number, code: string) => new Response(JSON.stringify({ ok: code === 'ok', code }), { status, headers });
const encoder = new TextEncoder();
async function hash(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)))).map(n => n.toString(16).padStart(2, '0')).join('');
}
Deno.serve(async req => {
  if (req.headers.get('origin') !== origin) return reply(403, 'forbidden');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply(405, 'method');
  if (!req.headers.get('content-type')?.startsWith('application/json')) return reply(415, 'invalid');
  if (Number(req.headers.get('content-length') || 0) > 16000) return reply(413, 'invalid');
  try {
    const raw = await req.text();
    if (encoder.encode(raw).length > 16000) return reply(413, 'invalid');
    const b = JSON.parse(raw);
    if (b.website || !Number.isFinite(b.startedAt) || Date.now() - b.startedAt < 1500 || Date.now() - b.startedAt > 86400000) return reply(400, 'invalid');
    if (typeof b.name !== 'string' || typeof b.email !== 'string' || typeof b.message !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.requestId)) return reply(400, 'invalid');
    if (b.consent !== true || b.privacyVersion !== '2026-10-26-v1' || !['admin','production'].includes(b.topic) || !['chatbot','contact'].includes(b.source)) return reply(400, 'invalid');
    if (!b.name.trim() || b.name.length > 80 || b.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) || b.message.trim().length < 10 || b.message.length > 2000) return reply(400, 'invalid');
    const url = Deno.env.get('SUPABASE_URL')!;
    const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!url || !secret) return reply(503, 'unavailable');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown';
    const [ipHash,emailHash] = await Promise.all([hash('ip:'+ip,secret),hash('email:'+b.email.trim().toLowerCase(),secret)]);
    const response = await fetch(url+'/rest/v1/rpc/submit_portfolio_inquiry', { method:'POST', headers:{'Content-Type':'application/json',apikey:secret,Authorization:'Bearer '+secret}, body:JSON.stringify({p_request_id:b.requestId,p_name:b.name,p_email:b.email,p_message:b.message,p_consent:true,p_notice:b.privacyVersion,p_source:'portfolio-'+b.source+'-'+b.topic,p_ip_hash:ipHash,p_email_hash:emailHash}), signal:AbortSignal.timeout(10000) });
    if (!response.ok) return reply(503,'unavailable');
    const result = await response.json();
    return result === 'ok' ? reply(200,'ok') : result === 'limited' ? reply(429,'limited') : reply(400,'invalid');
  } catch { return reply(503,'unavailable'); }
});
