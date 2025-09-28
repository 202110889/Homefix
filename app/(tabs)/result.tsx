import { useTheme } from "@/contexts/ThemeContext";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ResultScreen() {
  const { themeColors } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  // 라우터에서 전달받은 파라미터들
  const params = useLocalSearchParams();

  const {
    problem = "분석 결과 없음",
    location = "위치 정보 없음",
    solution = "해결책 정보 없음",
    user_image_uri = "",
  } = params;

  const goToHome = () => {
    router.replace("/");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        edges={["top", "left", "right", "bottom"]}
      >
        {/* 상단 메뉴 바 */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowSettings(true)}
          >
            <View style={styles.menuIcon}>
              <View
                style={[styles.menuLine, { backgroundColor: themeColors.text }]}
              />
              <View
                style={[styles.menuLine, { backgroundColor: themeColors.text }]}
              />
              <View
                style={[styles.menuLine, { backgroundColor: themeColors.text }]}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
            <View style={styles.homeIcon}>
              <View
                style={[
                  styles.homeRoof,
                  { borderBottomColor: themeColors.text },
                ]}
              />
              <View
                style={[styles.homeBase, { backgroundColor: themeColors.text }]}
              />
            </View>
          </TouchableOpacity>
        </View>

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

        {/* 설정 모달 */}
        <Modal
          visible={showSettings}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.settingsPanel,
                { backgroundColor: themeColors.background },
              ]}
            >
              <View
                style={[
                  styles.settingsHeader,
                  { borderBottomColor: themeColors.borderColor },
                ]}
              >
                <Text
                  style={[styles.settingsTitle, { color: themeColors.text }]}
                >
                  HomeFix
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSettings(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingsContent}>
                <TouchableOpacity
                  style={styles.settingsItem}
                  onPress={() => {
                    setShowSettings(false);
                    goToHome();
                  }}
                >
                  <View style={styles.settingsIcon}>
                    <View style={styles.homeIcon}>
                      <View
                        style={[
                          styles.homeRoof,
                          { borderBottomColor: themeColors.text },
                        ]}
                      />
                      <View
                        style={[
                          styles.homeBase,
                          { backgroundColor: themeColors.text },
                        ]}
                      />
                    </View>
                  </View>
                  <Text
                    style={[styles.settingsText, { color: themeColors.text }]}
                  >
                    홈으로
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  spacer: {
    flex: 1,
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    width: 20,
    height: 15,
    justifyContent: "space-between",
  },
  menuLine: {
    height: 2,
    borderRadius: 1,
  },
  homeButton: {
    padding: 5,
  },
  homeIcon: {
    width: 20,
    height: 15,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginBottom: 2,
  },
  homeBase: {
    width: 12,
    height: 6,
    borderRadius: 1,
  },
  // 설정 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  settingsPanel: {
    width: "70%",
    height: "100%",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  settingsContent: {
    padding: 20,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  settingsIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsText: {
    fontSize: 16,
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
});
