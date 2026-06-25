import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/appStore";

const { width } = Dimensions.get("window");

const TIMEZONE_OPTIONS = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Buenos_Aires",
  "America/Santiago",
  "America/Lima",
  "America/Montevideo",
  "Europe/Madrid",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Denver",
  "America/Toronto",
  "America/Sao_Paulo",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Lisbon",
];

function getCity(tz: string) {
  return tz.split("/")[1]?.replace("_", " ") || tz;
}

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reminderHour, setReminderHour] = useState(21);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  function animateSlide(toLeft: boolean) {
    slideAnim.setValue(toLeft ? 0 : 1);
    Animated.timing(slideAnim, {
      toValue: toLeft ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }

  function goToStep(s: number) {
    const goingForward = s > step;
    animateSlide(goingForward);
    setStep(s);
  }

  async function handleComplete() {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Completa todos los campos", "Necesitamos tu nombre y email para empezar");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding(name.trim(), email.trim(), reminderHour, timezone);
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Algo salió mal");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#000" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
          {/* Progress bar */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 48 }}>
            {[1, 2].map((s) => (
              <View
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: step >= s ? "#ff9500" : "#38383a",
                }}
              />
            ))}
          </View>

          {/* Step 1: Name + Email */}
          {step === 1 && (
            <Animated.View
              style={{
                flex: 1,
                opacity: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50],
                    }),
                  },
                ],
              }}
            >
              <Text style={{ fontSize: 56, marginBottom: 16 }}>📓</Text>
              <Text style={{ fontSize: 32, fontWeight: "700", color: "#fff", lineHeight: 38, marginBottom: 8 }}>
                Tu diario{"\n"}personal
              </Text>
              <Text style={{ fontSize: 16, color: "#8e8e93", lineHeight: 22, marginBottom: 40 }}>
                Cada noche documentas quién eras hoy. Dentro de un año verás en quién te convertiste.
              </Text>

              <Text style={{ fontSize: 13, fontWeight: "600", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Tu nombre
              </Text>
              <View style={{ backgroundColor: "#1c1c1e", borderRadius: 12, borderWidth: 1, borderColor: "#38383a", marginBottom: 24 }}>
                <TextInput
                  ref={nameRef}
                  placeholder="Alex"
                  placeholderTextColor="#636366"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  style={{ paddingHorizontal: 16, paddingVertical: 16, fontSize: 17, color: "#fff" }}
                />
              </View>

              <Text style={{ fontSize: 13, fontWeight: "600", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Tu email
              </Text>
              <View style={{ backgroundColor: "#1c1c1e", borderRadius: 12, borderWidth: 1, borderColor: "#38383a", marginBottom: 32 }}>
                <TextInput
                  ref={emailRef}
                  placeholder="alex@email.com"
                  placeholderTextColor="#636366"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ paddingHorizontal: 16, paddingVertical: 16, fontSize: 17, color: "#fff" }}
                />
              </View>

              <TouchableOpacity
                onPress={() => goToStep(2)}
                disabled={!name.trim() || !email.trim()}
                activeOpacity={0.8}
                style={{
                  backgroundColor: !name.trim() || !email.trim() ? "#38383a" : "#ff9500",
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 17, fontWeight: "600", color: !name.trim() || !email.trim() ? "#636366" : "#000" }}>
                  Continuar
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Step 2: Time + Timezone */}
          {step === 2 && (
            <Animated.View
              style={{
                flex: 1,
                opacity: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              }}
            >
              <Text style={{ fontSize: 56, marginBottom: 16 }}>⏰</Text>
              <Text style={{ fontSize: 32, fontWeight: "700", color: "#fff", lineHeight: 38, marginBottom: 8 }}>
                Elige tu horario
              </Text>
              <Text style={{ fontSize: 16, color: "#8e8e93", lineHeight: 22, marginBottom: 32 }}>
                Todos los días a esta hora recibirás un recordatorio para escribir tu reunión.
              </Text>

              <Text style={{ fontSize: 13, fontWeight: "600", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
                Hora del recordatorio
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 32 }}>
                {[20, 21, 22, 23].map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    onPress={() => setReminderHour(hour)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: reminderHour === hour ? "#ff9500" : "#1c1c1e",
                      borderWidth: 1,
                      borderColor: reminderHour === hour ? "#ff9500" : "#38383a",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: reminderHour === hour ? "#000" : "#fff",
                      }}
                    >
                      {hour}:00
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 13, fontWeight: "600", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
                Zona horaria
              </Text>
              <View style={{ backgroundColor: "#1c1c1e", borderRadius: 14, borderWidth: 1, borderColor: "#38383a", maxHeight: 240, marginBottom: 32 }}>
                <ScrollView showsVerticalScrollIndicator={true} style={{ borderRadius: 14 }}>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <TouchableOpacity
                      key={tz}
                      onPress={() => setTimezone(tz)}
                      activeOpacity={0.6}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: timezone === tz ? "#ff9500" : "transparent",
                        borderBottomWidth: 1,
                        borderBottomColor: "#38383a",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: timezone === tz ? "600" : "400",
                          color: timezone === tz ? "#000" : "#fff",
                        }}
                      >
                        {getCity(tz)}
                      </Text>
                      {timezone !== tz && (
                        <Text style={{ fontSize: 12, color: "#636366", marginTop: 2 }}>
                          {tz}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {timezone && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 8 }}>
                  <Text style={{ fontSize: 14 }}>🌍</Text>
                  <Text style={{ fontSize: 15, color: "#8e8e93" }}>
                    Tu zona: <Text style={{ color: "#fff", fontWeight: "600" }}>{timezone}</Text>
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => goToStep(1)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#1c1c1e",
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#38383a",
                  }}
                >
                  <Text style={{ fontSize: 17, fontWeight: "600", color: "#8e8e93" }}>
                    Atrás
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleComplete}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    backgroundColor: "#ff9500",
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 17, fontWeight: "600", color: "#000" }}>
                    {isSubmitting ? "Creando..." : "Comenzar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
