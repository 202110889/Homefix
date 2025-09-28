import { useTheme } from "@/contexts/ThemeContext";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ResultScreen() {
  const { themeColors } = useTheme();
  // 라우터에서 전달받은 파라미터들
  const params = useLocalSearchParams();

  const {
    problem = "분석 결과 없음",
    location = "위치 정보 없음",
    solution = "해결책 정보 없음",
    user_image_uri = "",
  } = params;

  const goBack = () => {
    router.back();
  };

  const goToHome = () => {
    router.back();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        edges={["top", "left", "right", "bottom"]}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: themeColors.headerBackground },
          ]}
        >
          <Text style={[styles.title, { color: themeColors.text }]}>
            사진으로 물어보기
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.text }]}>
            AI가 분석한 결과입니다
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 이미지 표시 영역 */}
          <View style={styles.imageContainer}>
            {user_image_uri && typeof user_image_uri === "string" ? (
              <Image source={{ uri: user_image_uri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>분석된 이미지</Text>
              </View>
            )}
          </View>

          {/* 문제 유형 카드 */}
          <View
            style={[
              styles.resultCard,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>
              문제: {problem}
            </Text>
          </View>

          {/* 해결책 카드 */}
          <View
            style={[
              styles.resultCard,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>
              해결책
            </Text>
            <Text style={[styles.solutionText, { color: themeColors.text }]}>
              {solution}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>다시 분석하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
            <Text style={styles.homeButtonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: "#666",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#000",
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#000",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  solutionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  homeButton: {
    flex: 1,
    backgroundColor: "#34c759",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  homeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
