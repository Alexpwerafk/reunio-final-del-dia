import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lmngrpcjvtizahdwjzfe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbmdycGNqdnRpemFoZHdqemZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU0NzUsImV4cCI6MjA5NzkxMTQ3NX0.A7wUeBlXTNH9em-90pyBFs9VUnKEGIttjERYkoHU6Wo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
