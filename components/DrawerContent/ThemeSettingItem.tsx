import { useFontScale } from "@/contexts/FontScaleContext"; // 1. FontScaleContext import 추가
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ThemeSettingItem({
  styles,
  onThemeChange,
  themeColors: passedColors,
  onPress,
}: {
  styles: any;
  onThemeChange?: (newTheme: any) => void;
  themeColors?: any;
  onPress: () => void;
}) {
  const { isDarkMode, toggleDarkMode, themeColors: contextColors } = useTheme();
  const { fontScale } = useFontScale(); // 2. useFontScale Hook 사용
  const themeColors = passedColors ?? contextColors;

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={() => {
        toggleDarkMode();
      }}
    >
      <View style={styles.settingsIcon}>
        {/* keep icon appearance but ensure text/toggle use theme */}
        <View style={isDarkMode ? styles.moonIcon : styles.sunIcon} />
      </View>

      {/* 3. Text 스타일에 fontScale 적용 */}
      <Text
        style={[
          styles.settingsText,
          { color: themeColors.text },
          { fontSize: styles.settingsText.fontSize * fontScale },
        ]}
      >
        다크 모드
      </Text>

      <View style={styles.toggleContainer}>
        <View
          style={[
            styles.toggle,
            isDarkMode && styles.toggleActive,
            isDarkMode && { backgroundColor: themeColors.tint },
          ]}
        >
          <View
            style={[styles.toggleThumb, isDarkMode && styles.toggleThumbActive]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
