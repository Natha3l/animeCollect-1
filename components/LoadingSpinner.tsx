import React from "react";
import { ActivityIndicator, View } from "react-native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Chargement...",
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ThemedView style={tw`flex-1 justify-center items-center`}>
      <ActivityIndicator
        size="large"
        color={colorScheme === "light" ? Colors.light.tint : Colors.dark.tint}
      />
      {message && (
        <ThemedText style={tw`mt-4 text-center`}>{message}</ThemedText>
      )}
    </ThemedView>
  );
}
