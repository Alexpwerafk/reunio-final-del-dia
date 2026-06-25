import { useState, useRef, useEffect } from "react";
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
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { ReviewFormData } from "@/types";

const { width } = Dimensions.get("window");

const QUESTIONS = [
  {
    key: "accomplishments" as keyof ReviewFormData,
    emoji: "✅",
    label: "¿Qué lograste hoy?",
    placeholder: "Hoy conseguí...",
  },
  {
    key: "pending" as keyof ReviewFormData,
    emoji: "⏳",
    label: "¿Qué quedó pendiente?",
    placeholder: "No pude terminar...",
  },
  {
    key: "learnings" as keyof ReviewFormData,
    emoji: "🧠",
    label: "¿Qué aprendiste hoy?",
    placeholder: "Hoy aprendí que...",
  },
  {
    key: "blockers" as keyof ReviewFormData,
    emoji: "🚧",
    label: "¿Qué te bloqueó?",
    placeholder: "Me costó avanzar por...",
  },
  {
    key: "tomorrow_priority" as keyof ReviewFormData,
    emoji: "🎯",
    label: "¿Cuál es tu prioridad mañana?",
    placeholder: "Mañana lo primero que haré es...",
  },
];

export default function Review() {
  const router = useRouter();
  const submitReview = useAppStore((s) => s.submitReview);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    accomplishments: "",
    pending: "",
    learnings: "",
    blockers: "",
    tomorrow_priority: "",
  });

  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / QUESTIONS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [currentStep]);

  function animateSlide(direction: "left" | "right") {
    slideAnim.setValue(direction === "left" ? 1 : 0);
    Animated.timing(slideAnim, {
      toValue: direction === "left" ? 0 : 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }

  function handleContinue() {
    const currentKey = QUESTIONS[currentStep].key;
    if (!formData[currentKey].trim()) {
      Alert.alert("Escribe algo", "Responde la pregunta antes de continuar");
      return;
    }
    if (currentStep < QUESTIONS.length - 1) {
      animateSlide("left");
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      animateSlide("right");
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleSubmit() {
    const currentKey = QUESTIONS[currentStep].key;
    if (!formData[currentKey].trim()) {
      Alert.alert("Escribe algo", "Responde antes de enviar");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview(formData);
      if (result.success) {
        router.replace("/dashboard");
      } else {
        Alert.alert("Error", result.error || "No se pudo enviar");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const question = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;
  const currentValue = formData[question.key];
  const progress = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#000" }}
    >
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 64 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ padding: 4 }}>
            <Text style={{ fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#8e8e93" }}>
            {currentStep + 1} / {QUESTIONS.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: "#38383a", borderRadius: 2, marginBottom: 40, overflow: "hidden" }}>
          <Animated.View
            style={{
              height: "100%",
              backgroundColor: "#ff9500",
              borderRadius: 2,
              width: progress,
            }}
          />
        </View>

        {/* Question card */}
        <Animated.View
          style={{
            flex: 1,
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -60],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>{question.emoji}</Text>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#fff", lineHeight: 34, marginBottom: 24 }}>
            {question.label}
          </Text>

          <View style={{ backgroundColor: "#1c1c1e", borderRadius: 16, borderWidth: 1, borderColor: "#38383a", padding: 4 }}>
            <TextInput
              ref={inputRef}
              placeholder={question.placeholder}
              placeholderTextColor="#636366"
              value={currentValue}
              onChangeText={(text) => setFormData({ ...formData, [question.key]: text })}
              multiline
              autoFocus
              maxLength={2000}
              style={{
                padding: 16,
                fontSize: 17,
                color: "#fff",
                lineHeight: 24,
                minHeight: 180,
                textAlignVertical: "top",
              }}
            />
          </View>

          <Text style={{ fontSize: 13, color: "#636366", textAlign: "right", marginTop: 8 }}>
            {currentValue.length}/2000
          </Text>
        </Animated.View>

        {/* Navigation */}
        <View style={{ flexDirection: "row", gap: 12, paddingBottom: 32, paddingTop: 8 }}>
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handleBack}
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
              <Text style={{ fontSize: 17, fontWeight: "600", color: "#8e8e93" }}>Atrás</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={isLast ? handleSubmit : handleContinue}
            disabled={!currentValue.trim() || isSubmitting}
            activeOpacity={0.85}
            style={{
              flex: 1,
              backgroundColor: !currentValue.trim() ? "#38383a" : "#ff9500",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ fontSize: 17, fontWeight: "600", color: !currentValue.trim() ? "#636366" : "#000" }}>
                {isLast ? "Enviar reunión" : "Siguiente"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
