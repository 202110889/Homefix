import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function InquiryItem({
  styles,
  onPress,
}: {
  styles: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsIcon}>
        <View style={styles.inquiryIcon}>
          <View style={styles.personIcon} />
          <View style={styles.wrenchIcon} />
        </View>
      </View>
      <Text style={styles.settingsText}>문의하기</Text>
    </TouchableOpacity>
  );
}
