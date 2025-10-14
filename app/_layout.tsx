import CustomDrawerContent from "@/components/CustomDrawerContents";
import { FontScaleProvider } from "@/contexts/FontScaleContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, TouchableOpacity, View } from "react-native";

function DrawerWrapper() {
  const { themeColors } = useTheme();

  const goToHome = () => {
    try {
      router.replace({ pathname: "/(tabs)" });
    } catch (e) {
      router.push("/(tabs)");
    }
  };

  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "",
          headerShown: true,
          headerTintColor: themeColors.text,
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerRight: () => (
            <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
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
            </TouchableOpacity>
          ),
        }}
      />
    </Drawer>
  );
}

export default function _Layout({ screenOptions }: { screenOptions?: any }) {
  return (
    <ThemeProvider>
      <FontScaleProvider>
        <DrawerWrapper />
      </FontScaleProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  homeButton: {
    padding: 5,
    marginRight: 15,
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
    borderBottomColor: "#333333",
  },
  homeBase: {
    width: 12,
    height: 6,
    borderRadius: 1,
    backgroundColor: "#333333",
  },
});
