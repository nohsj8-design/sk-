-- Free pg_cron. Delete only portfolio submissions; preserve other services.
begin;
create extension if not exists pg_cron;
select cron.schedule(
  'portfolio-inquiry-retention-daily',
  '17 18 * * *', -- 03:17 Asia/Seoul
  $job$
    delete from public.inquiries
    where source in ('portfolio-contact-admin','portfolio-contact-production','portfolio-chatbot-admin','portfolio-chatbot-production')
      and created_at < now() - interval '30 days';
    delete from public.portfolio_inquiry_limits where created_at < now() - interval '2 days';
  $job$
);
commit;
