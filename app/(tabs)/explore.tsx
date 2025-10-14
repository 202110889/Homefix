import { createApiClient } from "@/config/api";
import { useFontScale } from "@/contexts/FontScaleContext";
import { useTheme } from "@/contexts/ThemeContext";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const { themeColors } = useTheme();
  const { fontScale } = useFontScale();
  const params = useLocalSearchParams();
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false); // 처음에는 모달 숨김
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  console.log("ExploreScreen params:", params);
  console.log("selectedImageUri:", selectedImageUri);
  console.log("isLoading:", isLoading);
  console.log("showImagePicker:", showImagePicker);
  console.log("isLeaving:", isLeaving);
  // 홈에서 버튼을 누르면 모달 표시
  const modalEffect = useCallback(() => {
    // 이 코드는 ExploreScreen이 포커싱될 때마다 실행됩니다.
    if (params.showModal === "true" && !selectedImageUri && !isLoading) {
      console.log("모달 표시 트리거됨");
      setShowImagePicker(true);
    }
    // 화면을 벗어날 때(unfocus) 실행될 정리(cleanup) 함수입니다.
    // 사용자가 다른 탭으로 이동하거나 뒤로 갈 때 모달이 확실히 닫히도록 보장합니다.
    return () => {
      setShowImagePicker(false);
    };
  }, [params.showModal, selectedImageUri, isLoading]);
  useFocusEffect(() => {
    modalEffect();
  });

  useEffect(() => {
    if (isLeaving) {
      // 1. 먼저 모달을 닫습니다.
      setShowImagePicker(false);
      // 상태를 다시 원상 복구하여, 다시 돌아왔을 때를 대비합니다.
      setIsLeaving(false);

      // 2. 모달이 닫힌 후(즉, 다음 렌더링 사이클에서) 화면을 전환합니다.
      // requestAnimationFrame을 사용해 다음 프레임에 실행되도록 보장합니다.
      requestAnimationFrame(() => {
        router.replace("/(tabs)");
      });
    }
  }, [isLeaving]);

  useEffect(() => {
    // 카메라 및 갤러리 권한 요청
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert("카메라 및 갤러리 접근 권한이 필요합니다.");
      }
    })();
  }, []);

  const convertToJpegBase64 = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return result.base64;
  };

  const handleImagePick = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 1,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        })
      : await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 1,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      try {
        const base64 = await convertToJpegBase64(asset.uri);
        setSelectedImageUri(asset.uri);
        setBase64Data(base64 || null);
        setShowImagePicker(false);
      } catch (err) {
        console.error("📛 이미지 처리 실패:", err);
        Alert.alert("이미지를 처리할 수 없습니다.");
      }
    }
  };

  const uploadImage = async () => {
    if (!base64Data) return;

    setIsLoading(true);
    try {
      console.log("업로드할 base64 길이:", base64Data?.length);
      const apiClient = createApiClient();

      // 이미지 분석
      const response = await apiClient.post("/analyze/", {
        image_base64: base64Data,
      });

      const responseData = response.data;

      // 결과 페이지로 이동 (사용자 이미지도 함께 전달)
      router.replace({
        pathname: "/(tabs)/result",
        params: {
          ...responseData,
          user_image_uri: selectedImageUri,
        },
      });
    } catch (error: any) {
      console.error("❌ axios 에러:", error?.message || error);
      Alert.alert("업로드 실패", "서버에 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedImageUri(null);
    setBase64Data(null);
    setShowImagePicker(true); // 이미지 선택 모달 다시 표시
  };

  const goBack = () => {
    // setShowImagePicker(false); // 모달 닫기(IOS에서 뒤로가기 버튼 대응)
    setIsLeaving(true);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        edges={["top", "left", "right", "bottom"]}
      >
        {/* 이미지 미리보기 화면 */}
        {selectedImageUri && !isLoading && (
          <>
            <View
              style={[
                styles.header,
                { backgroundColor: themeColors.headerBackground },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  { color: themeColors.text },
                  // 3. 폰트 스케일 적용
                  { fontSize: styles.title.fontSize * fontScale },
                ]}
              >
                사진으로 물어보기
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: themeColors.text },
                  // 3. 폰트 스케일 적용
                  { fontSize: styles.subtitle.fontSize * fontScale },
                ]}
              >
                문제가 있는 곳을 사진으로 찍어서 정확한 해결책을 받아보세요
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.image}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={removeImage}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={uploadImage}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.uploadButtonText,
                    // 3. 폰트 스케일 적용
                    {
                      fontSize: styles.uploadButtonText.fontSize * fontScale,
                    },
                  ]}
                >
                  분석하기
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 로딩 화면 */}
        {isLoading && selectedImageUri && (
          <>
            <View
              style={[
                styles.header,
                { backgroundColor: themeColors.headerBackground },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  { color: themeColors.text },
                  { fontSize: styles.title.fontSize * fontScale },
                ]}
              >
                사진으로 물어보기
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: themeColors.text },
                  { fontSize: styles.subtitle.fontSize * fontScale },
                ]}
              >
                문제가 있는 곳을 사진으로 찍어서 정확한 해결책을 받아보세요
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.image}
                />
              </View>

              <View
                style={[
                  styles.loadingContainer,
                  { backgroundColor: themeColors.cardBackground },
                ]}
              >
                <ActivityIndicator size="large" color="#007AFF" />
                <Text
                  style={[
                    styles.loadingText,
                    { color: themeColors.text },
                    // 3. 폰트 스케일 적용
                    { fontSize: styles.loadingText.fontSize * fontScale },
                  ]}
                >
                  분석 중...
                </Text>
              </View>
            </View>
          </>
        )}

        {/* 이미지 선택 모달 */}
        <Modal
          visible={showImagePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={goBack}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: themeColors.text },
                  // 3. 폰트 스케일 적용
                  { fontSize: styles.modalTitle.fontSize * fontScale },
                ]}
              >
                사진 선택
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleImagePick(true)}
              >
                <View style={styles.modalButtonContent}>
                  <Image
                    source={require("@/assets/images/camera.png")}
                    style={styles.modalIcon}
                  />
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: themeColors.text },
                      // 3. 폰트 스케일 적용
                      {
                        fontSize: styles.modalButtonText.fontSize * fontScale,
                      },
                    ]}
                  >
                    촬영하기
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleImagePick(false)}
              >
                <View style={styles.modalButtonContent}>
                  <Image
                    source={require("@/assets/images/gallery.png")}
                    style={styles.modalIcon}
                  />
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: themeColors.text },
                      // 3. 폰트 스케일 적용
                      {
                        fontSize: styles.modalButtonText.fontSize * fontScale,
                      },
                    ]}
                  >
                    갤러리에서 선택하기
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.backButton]}
                onPress={goBack}
              >
                <Text
                  style={[
                    styles.backButtonText,
                    { color: themeColors.text },
                    // 3. 폰트 스케일 적용
                    {
                      fontSize: styles.backButtonText.fontSize * fontScale,
                    },
                  ]}
                >
                  뒤로가기
                </Text>
              </TouchableOpacity>
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
  settingModalOverlay: {
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
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#000",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: "#007AFF",
  },
  modalButtonText: {
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#f0f0f0",
  },
  backButtonText: {
    fontSize: 16,
    textAlign: "center",
  },
});
