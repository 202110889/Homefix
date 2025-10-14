import { useTheme } from "@/contexts/ThemeContext";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import FontSettingItem from "./DrawerContent/FontSettingItem";
import InquiryItem from "./DrawerContent/InquiryItem";
import ThemeSettingItem from "./DrawerContent/ThemeSettingItem";

export default function CustomDrawerContent(props: any) {
  const navigation = props.navigation;
  const { themeColors } = useTheme();
  const [isFontSettingActive, setIsFontSettingActive] = useState(false);

  const goToHome = () => {
    try {
      router.replace({ pathname: "/(tabs)" });
    } catch (e) {
      router.push("/(tabs)");
    }
  };

  // 테마 변경 시 네비게이션 옵션 변경
  const handleThemeChange = (newTheme: any) => {
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        drawerStyle: {
          backgroundColor: newTheme.background,
        },
        headerStyle: {
          backgroundColor: newTheme.headerBackground,
        },
        headerTintColor: newTheme.text,
      });
    }
  };

  //themeColors가 바뀔 때 네비게이션 옵션을 자동으로 업데이트
  useEffect(() => {
    handleThemeChange(themeColors);
  }, [themeColors]);

  const handleFontSettingClick = () => {
    setIsFontSettingActive(!isFontSettingActive);
  };

  const handleThemeSettingClick = () => {
    setIsFontSettingActive(false); // FontSetting 비활성화
  };

  const handleInquiryClick = () => {
    setIsFontSettingActive(false); // FontSetting 비활성화
  };

  return (
    // apply theme background to the drawer container so the drawer visually updates
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: themeColors.background }}
      contentContainerStyle={{ flex: 1 }}
    >
      {/* <View style={[styles.headerBar, { borderBottomColor: themeColors.text }]}>
        <Text style={[styles.settingsTitle, { color: themeColors.text }]}>
          HomeFix
        </Text>
        <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
          <View style={styles.homeIcon}>
            <View
              style={[styles.homeRoof, { borderBottomColor: themeColors.text }]}
            />
            <View
              style={[styles.homeBase, { backgroundColor: themeColors.text }]}
            />
          </View>
        </TouchableOpacity>
      </View> */}
      {/* pass themeColors down so items can render with the current theme immediately */}
      <ThemeSettingItem
        styles={styles}
        onThemeChange={handleThemeChange}
        onPress={handleThemeSettingClick}
      />
      <FontSettingItem
        styles={styles}
        isActive={isFontSettingActive}
        onPress={handleFontSettingClick}
      />
      <InquiryItem styles={styles} onPress={handleInquiryClick} />
    </DrawerContentScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  mainButton: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  buttonDescription: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
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
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
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
    borderBottomColor: "#f0f0f0",
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
    color: "#333",
  },
  // 아이콘 스타일
  sunIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  moonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fef168ff",
    borderWidth: 2,
    borderColor: "#0c125bff",
  },
  fontIcon: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  fontText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 2,
  },
  fontTextSmall: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  inquiryIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  personIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#333",
    marginBottom: 2,
  },
  wrenchIcon: {
    width: 12,
    height: 2,
    backgroundColor: "#333",
    borderRadius: 1,
  },
  // 토글 버튼 스타일
  toggleContainer: {
    marginLeft: "auto",
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: "#007AFF",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
});
