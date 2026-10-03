-- Apply in the Supabase SQL Editor before testing signup.
-- This adds a signup trigger; it does not alter tables, rows, or existing foreign keys.

create or replace function public.campusflow_profile_after_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  signup_full_name text;
  signup_college_id uuid;
  signup_role text;
begin
  signup_full_name :=
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'full_name'), '');
  signup_college_id :=
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'college_id'), '')::uuid;
  signup_role :=
    coalesce(
      nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'role'), ''),
      'student'
    );

  if signup_full_name is null then
    raise exception 'Signup metadata must include full_name';
  end if;

  if signup_college_id is null then
    raise exception 'Signup metadata must include college_id';
  end if;

  -- Self-service signup is student-only; never trust client metadata for elevated roles.
  if signup_role <> 'student' then
    raise exception 'Self-service signup role must be student';
  end if;

  insert into public.profiles (id, college_id, full_name, role, created_at)
  values (
    new.id,
    signup_college_id,
    signup_full_name,
    signup_role,
    pg_catalog.now()
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

revoke all on function public.campusflow_profile_after_auth_signup() from public;

drop trigger if exists campusflow_profile_after_auth_signup on auth.users;

create trigger campusflow_profile_after_auth_signup
after insert on auth.users
for each row
execute function public.campusflow_profile_after_auth_signup();