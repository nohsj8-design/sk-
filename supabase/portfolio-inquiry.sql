-- Existing inquiries stay private. Run only in art-chronicles-busan.
begin;
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
create table if not exists public.portfolio_inquiry_limits (
  request_id uuid primary key,
  ip_hash text not null,
  email_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.portfolio_inquiry_limits enable row level security;
revoke all on public.portfolio_inquiry_limits from anon, authenticated;
create or replace function public.submit_portfolio_inquiry(
  p_request_id uuid, p_name text, p_email text, p_message text,
  p_consent boolean, p_notice text, p_source text, p_ip_hash text, p_email_hash text
) returns text language plpgsql security definer set search_path = '' as $$
begin
  if p_consent is distinct from true or char_length(trim(p_name)) not between 1 and 80
    or char_length(p_email) not between 3 and 254 or char_length(trim(p_message)) not between 10 and 2000
    or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_source not in ('portfolio-contact-admin','portfolio-contact-production','portfolio-chatbot-admin','portfolio-chatbot-production')
    or char_length(p_ip_hash) <> 64 or char_length(p_email_hash) <> 64
    or p_notice <> '2026-10-26-v1' then return 'invalid'; end if;
  -- Serialize this low-volume public form: enforce caps atomically.
  perform pg_catalog.pg_advisory_xact_lock(7711026);
  if exists(select 1 from public.portfolio_inquiry_limits where request_id=p_request_id) then return 'ok'; end if;
  delete from public.portfolio_inquiry_limits where created_at < now()-interval '2 days';
  if (select count(*) from public.portfolio_inquiry_limits where created_at >= now()-interval '1 day') >= 50
    or (select count(*) from public.portfolio_inquiry_limits where ip_hash=p_ip_hash and created_at >= now()-interval '1 hour') >= 3
    or (select count(*) from public.portfolio_inquiry_limits where email_hash=p_email_hash and created_at >= now()-interval '1 day') >= 3 then return 'limited'; end if;
  insert into public.inquiries(id,name,email,message,consent,privacy_notice,source,status,memo,created_at)
    values(p_request_id,trim(p_name),lower(trim(p_email)),trim(p_message),true,p_notice,p_source,'new','',now());
  insert into public.portfolio_inquiry_limits(request_id,ip_hash,email_hash) values(p_request_id,p_ip_hash,p_email_hash);
  return 'ok';
end; $$;
revoke all on function public.submit_portfolio_inquiry(uuid,text,text,text,boolean,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_portfolio_inquiry(uuid,text,text,text,boolean,text,text,text,text) to service_role;
commit;
