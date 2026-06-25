import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { useAppStore } from "@/store/appStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const profile = JSON.parse(storedUser);
      setUser(profile);
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 48, height: 48 }}>
        <ActivityIndicator size="large" color="#ff9500" />
      </View>
      <Text style={{ color: "#8e8e93", marginTop: 16, fontSize: 16, fontFamily: "System" }}>
        Cargando...
      </Text>
    </View>
  );
}
