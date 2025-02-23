import { Stack } from "expo-router";
import { ThemeProvider } from "../app/context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "black",
          },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "My Timers",
          }}
        />
        <Stack.Screen
          name="add-timer"
          options={{
            title: "Add Timer",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: "History",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
