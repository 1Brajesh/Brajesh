export const BRAJESH_SUPABASE_URL = "https://pjbpghknzqmwfykbtvzp.supabase.co";
export const BRAJESH_SUPABASE_KEY = "sb_publishable_c-jEz8WNtOn5etyRxCrKNw_WIU-GBPE";

export function createBrajeshClient() {
  if (!window.supabase?.createClient) {
    throw new Error("Could not load Supabase.");
  }

  return window.supabase.createClient(BRAJESH_SUPABASE_URL, BRAJESH_SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function getBrajeshRedirectURL(pathname = "/admin/") {
  return new URL(pathname, window.location.origin).toString();
}

export async function sendBrajeshMagicLink(client, email, pathname = "/admin/") {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Enter an email address.");
  }

  const { error } = await client.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: getBrajeshRedirectURL(pathname),
      // Keep sign-in smooth for the single-owner flow. Access is still enforced by RLS.
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw error;
  }

  return normalizedEmail;
}

export async function getBrajeshSessionUser(client) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function isBrajeshAdmin(client, email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return false;

  const { data, error } = await client
    .from("brajesh_admins")
    .select("email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data?.email);
}

export async function requireBrajeshAdmin(client) {
  const user = await getBrajeshSessionUser(client);
  if (!user?.email) {
    return { user: null, isAdmin: false };
  }

  const admin = await isBrajeshAdmin(client, user.email);
  return {
    user,
    isAdmin: admin,
  };
}

export async function signOutBrajesh(client) {
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}
