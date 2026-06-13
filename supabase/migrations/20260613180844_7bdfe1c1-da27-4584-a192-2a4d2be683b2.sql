-- Create missing trigger on auth.users so signups auto-create a profile row.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: create profile + role rows for any existing auth users that don't have one yet.
INSERT INTO public.profiles (id, email, full_name, brand_name, whatsapp)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'full_name',''),
       COALESCE(u.raw_user_meta_data->>'brand_name',''),
       COALESCE(u.raw_user_meta_data->>'whatsapp','')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id,
       CASE WHEN (SELECT count(*) FROM public.user_roles) = 0
              AND u.id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
            THEN 'admin'::public.app_role
            ELSE 'partner'::public.app_role
       END
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL;