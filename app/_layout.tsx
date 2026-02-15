import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as SQLite from "expo-sqlite";

import { useColorScheme } from "@/hooks/useColorScheme";
import { initializeDatabase } from "@/utils/db";
import { bootstrapBackgroundServices } from "@/utils/backgroundBootstrap";

void bootstrapBackgroundServices();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SQLite.SQLiteProvider databaseName="caps.db" onInit={initializeDatabase}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="add-hat" options={{ title: "Add Hat" }} />
          <Stack.Screen name="edit-hat" options={{ title: "Edit Hat" }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SQLite.SQLiteProvider>
  );
}
