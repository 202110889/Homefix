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
  const themeColors = passedColors ?? contextColors;
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={() => {
        toggleDarkMode();
        onPress();
      }}
    >
      <View style={styles.settingsIcon}>
        {/* keep icon appearance but ensure text/toggle use theme */}
        <View style={styles.sunIcon} />
      </View>
      <Text style={[styles.settingsText, { color: themeColors.text }]}>
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
