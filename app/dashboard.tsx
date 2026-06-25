import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { formatDateES, getTodayDate, getDayNumber } from "@/utils/date";

export default function Dashboard() {
  const router = useRouter();
  const { user, todayReview, loadTodayReview, loadHistory, history } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      loadTodayReview();
      loadHistory();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTodayReview(), loadHistory()]);
    setRefreshing(false);
  }, []);

  if (!user) return null;

  const today = getTodayDate(user.timezone);
  const dayNumber = getDayNumber(user.created_at, today);
  const hasCompletedToday = !!todayReview;
  const formattedDate = formatDateES(today);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000" }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff9500" />
      }
    >
      <Animated.View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 32, opacity: fadeAnim }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Día {dayNumber}
          </Text>
          <TouchableOpacity onPress={() => router.push("/history")} activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#1c1c1e", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#38383a" }}>
            <Text style={{ fontSize: 13, color: "#8e8e93", fontWeight: "500" }}>Historial</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 28, fontWeight: "700", color: "#fff", marginTop: 4, marginBottom: 32 }}>
          {user.name?.split(" ")[0]}, ¿cómo estuvo tu día?
        </Text>

        {/* Streak ring */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: "#1c1c1e", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "#ff9500" }}>
            <Text style={{ fontSize: 48, fontWeight: "800", color: "#fff" }}>
              {user.streak}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#ff9500", marginTop: -4 }}>
              días
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 6 }}>
            <Text style={{ fontSize: 18 }}>🔥</Text>
            <Text style={{ fontSize: 16, color: "#8e8e93" }}>
              Racha actual
            </Text>
          </View>
        </View>

        {/* Next meeting */}
        <View style={{ backgroundColor: "#1c1c1e", borderRadius: 16, borderWidth: 1, borderColor: "#38383a", padding: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hasCompletedToday ? "#30d158" : "#ff9500" }} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.8 }}>
              {hasCompletedToday ? "Completado" : "Próxima reunión"}
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
            {hasCompletedToday ? "¡Hoy ya escribiste! 🌙" : `Hoy a las ${user.reminder_hour}:00`}
          </Text>
          <Text style={{ fontSize: 15, color: "#636366", marginTop: 4 }}>
            {formattedDate}
          </Text>
        </View>

        {/* CTA */}
        {!hasCompletedToday ? (
          <TouchableOpacity
            onPress={() => router.push("/review")}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#ff9500",
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
              marginBottom: 24,
              shadowColor: "#ff9500",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>
              Comenzar reunión
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 18, marginBottom: 24 }}>
            <Text style={{ fontSize: 17, color: "#8e8e93", textAlign: "center" }}>
              Nos vemos mañana ✨
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { value: history.length, label: "Reuniones" },
            { value: user.streak, label: "Racha" },
            { value: dayNumber, label: "Días" },
          ].map((stat, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: "#1c1c1e",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#38383a",
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 26, fontWeight: "700", color: "#fff" }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "500", color: "#636366", marginTop: 4 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}
