create table "public"."pi_session" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "session_id" uuid not null,
    "organization_id" uuid not null
);
CREATE UNIQUE INDEX pi_session_pkey ON public.pi_session USING btree (id);
alter table "public"."pi_session"
add constraint "pi_session_pkey" PRIMARY KEY using index "pi_session_pkey";
alter table "public"."pi_session"
add constraint "public_pi_session_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organization(id) not valid;
alter table "public"."pi_session" validate constraint "public_pi_session_organization_id_fkey";
alter table "public"."pi_session" enable row level security;
REVOKE all PRIVILEGES on "public"."pi_session"
from authenticated;
REVOKE all PRIVILEGES on "public"."pi_session"
from anon;
CREATE UNIQUE INDEX pi_session_session_id_key ON public.pi_session USING btree (session_id);
ALTER TABLE "public"."pi_session"
ADD CONSTRAINT "pi_session_session_id_key" UNIQUE USING INDEX "pi_session_session_id_key";