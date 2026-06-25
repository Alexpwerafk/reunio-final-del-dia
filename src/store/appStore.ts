import { create } from "zustand";
import { User, DailyReview, ReviewFormData } from "@/types";
import { getTodayDate, calculateStreak } from "@/utils/date";
import { supabase } from "@/lib/supabase";

interface AppState {
  user: User | null;
  todayReview: DailyReview | null;
  history: DailyReview[];
  isLoading: boolean;
  isLocal: boolean;

  setUser: (user: User | null) => void;
  loadTodayReview: () => Promise<void>;
  loadHistory: () => Promise<void>;
  submitReview: (data: ReviewFormData) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (name: string, email: string, reminderHour: number, timezone: string) => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  todayReview: null,
  history: [],
  isLoading: false,
  isLocal: false,

  setUser: (user) => set({ user }),

  signIn: async (email) => {
    // Magic link login - Supabase sends an email with a login link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "reunion-final://login",
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  completeOnboarding: async (name, email, reminderHour, timezone) => {
    set({ isLoading: true });
    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
        options: {
          data: { name },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      const userId = authData.user.id;

      // Insertar perfil en tabla users
      const { error: profileError } = await supabase.from("users").insert({
        id: userId,
        email,
        name,
        timezone,
        reminder_hour: reminderHour,
        streak: 0,
      });

      if (profileError) throw profileError;

      const user: User = {
        id: userId,
        email,
        name,
        timezone,
        reminder_hour: reminderHour,
        streak: 0,
        created_at: new Date().toISOString(),
      };

      set({ user, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadTodayReview: async () => {
    const { user } = get();
    if (!user) return;

    const today = getTodayDate(user.timezone);
    set({ isLoading: true });

    const { data, error } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    set({ isLoading: false, todayReview: data || null });
  },

  loadHistory: async () => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });

    const { data, error } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading history:", error);
    }

    set({ history: data || [], isLoading: false });
  },

  submitReview: async (data) => {
    const { user, history } = get();
    if (!user) return { success: false, error: "Usuario no autenticado" };

    const today = getTodayDate(user.timezone);

    set({ isLoading: true });

    // Validar que no exista revisión para hoy
    const { data: existing, error: checkError } = await supabase
      .from("daily_reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (checkError) {
      set({ isLoading: false });
      return { success: false, error: checkError.message };
    }

    if (existing) {
      set({ isLoading: false });
      return { success: false, error: "Ya completaste la reunión de hoy" };
    }

    // Validar que no haya saltado días (gap check)
    if (history.length > 0) {
      const lastDate = history[0].date;
      const todayDate = new Date(today);
      const last = new Date(lastDate);
      const diffDays = Math.floor(
        (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 1) {
        set({ isLoading: false });
        return { success: false, error: "No puedes saltarte días. Streak reiniciado." };
      }
    }

    const newStreak = calculateStreak(history, today);

    const review: DailyReview = {
      id: crypto.randomUUID(),
      user_id: user.id,
      date: today,
      accomplishments: data.accomplishments,
      pending: data.pending,
      learnings: data.learnings,
      blockers: data.blockers,
      tomorrow_priority: data.tomorrow_priority,
      newsletter_sent: false,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from("daily_reviews").insert(review);

    if (insertError) {
      set({ isLoading: false });
      return { success: false, error: insertError.message };
    }

    // Actualizar streak en perfil
    const { error: updateError } = await supabase
      .from("users")
      .update({ streak: newStreak })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating streak:", updateError);
    }

    const updatedUser = { ...user, streak: newStreak };
    const newHistory = [review, ...history];

    set({
      user: updatedUser,
      todayReview: review,
      history: newHistory,
      isLoading: false,
    });

    return { success: true };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, todayReview: null, history: [] });
  },
}));
