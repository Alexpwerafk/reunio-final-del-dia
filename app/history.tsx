import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/appStore";
import { formatDateES } from "@/utils/date";
import { DailyReview } from "@/types";

export default function History() {
  const router = useRouter();
  const { history, loadHistory } = useAppStore();
  const [selectedReview, setSelectedReview] = useState<DailyReview | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  function renderReviewItem({ item, index }: { item: DailyReview; index: number }) {
    const dayNum = history.length - index;

    return (
      <TouchableOpacity
        onPress={() => setSelectedReview(item)}
        activeOpacity={0.6}
        style={{
          backgroundColor: "#1c1c1e",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#38383a",
          padding: 16,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#ff9500" }}>
              Día {dayNum}
            </Text>
            {item.newsletter_sent && (
              <Text style={{ fontSize: 12 }}>📧</Text>
            )}
          </View>
          <Text style={{ fontSize: 14, color: "#636366" }}>{formatDateES(item.date)}</Text>
        </View>
        <Text style={{ fontSize: 15, color: "#8e8e93" }} numberOfLines={2}>
          {item.accomplishments}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 64, paddingBottom: 12 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 24, color: "#fff" }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#fff" }}>Historial</Text>
        <Text style={{ fontSize: 15, color: "#636366", marginLeft: "auto" }}>
          {history.length} reuniones
        </Text>
      </View>

      {/* List */}
      {history.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
          <Text style={{ fontSize: 17, color: "#8e8e93", textAlign: "center", lineHeight: 24 }}>
            Aún no tienes reuniones.{"\n"}
            Tu primera reunión aparecerá aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selectedReview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedReview(null)}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }} showsVerticalScrollIndicator={false}>
            {/* Close */}
            <TouchableOpacity
              onPress={() => setSelectedReview(null)}
              activeOpacity={0.7}
              style={{ alignSelf: "flex-end", backgroundColor: "#1c1c1e", width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 16 }}
            >
              <Text style={{ fontSize: 18, color: "#8e8e93" }}>✕</Text>
            </TouchableOpacity>

            {selectedReview && (
              <>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#ff9500", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  Reunión Final del Día
                </Text>
                <Text style={{ fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 4 }}>
                  {formatDateES(selectedReview.date)}
                </Text>
                {selectedReview.newsletter_sent && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 6 }}>
                    <Text style={{ fontSize: 14 }}>📧</Text>
                    <Text style={{ fontSize: 14, color: "#30d158" }}>Newsletter enviado</Text>
                  </View>
                )}

                <View style={{ borderTopWidth: 1, borderTopColor: "#38383a", paddingTop: 24 }}>
                  <ReviewSection emoji="✅" title="¿Qué lograste hoy?" content={selectedReview.accomplishments} />
                  <ReviewSection emoji="⏳" title="¿Qué quedó pendiente?" content={selectedReview.pending} />
                  <ReviewSection emoji="🧠" title="¿Qué aprendiste hoy?" content={selectedReview.learnings} />
                  <ReviewSection emoji="🚧" title="¿Qué te bloqueó?" content={selectedReview.blockers} />
                  <ReviewSection emoji="🎯" title="Prioridad mañana" content={selectedReview.tomorrow_priority} />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function ReviewSection({ emoji, title, content }: { emoji: string; title: string; content: string }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
        {emoji} {title}
      </Text>
      <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24 }}>
        {content}
      </Text>
    </View>
  );
}
