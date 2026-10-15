# Supabase setup

1. In the Supabase project, open **SQL Editor**, paste `supabase/schema.sql`, and run it. This creates `public.profiles` with `id` and `name`, enables row-level security, and adds a trigger to create each profile when its auth user signs up.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_ANON_KEY` to the project's publishable key (or legacy anon key). The project URL is already filled in.
3. To allow direct registration without email confirmation, open **Authentication > Sign In / Providers > Email** in Supabase and turn off **Confirm email**. Then run `npm run dev`, choose **Create account**, and register with an email, name, and password. The app signs the user in immediately when Supabase returns a session. Disabling confirmation reduces account verification, so use it only if that tradeoff is acceptable.
4. `.env.local` is ignored by Git and is only for local development. In Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project Settings > Environment Variables** for each environment you deploy (Production, Preview, and/or Development), then redeploy so the values are included in the build.

Never put a Supabase `service_role` or secret key in a `VITE_` variable or browser code. Passwords are stored and verified by Supabase Auth; they are deliberately not columns in `public.profiles`.