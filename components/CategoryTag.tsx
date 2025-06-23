import React from "react";
import { TouchableOpacity } from "react-native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { KitsuCategory } from "@/services/api";

interface CategoryTagProps {
  category: KitsuCategory;
  onPress: (category: KitsuCategory) => void;
}

export default function CategoryTag({ category, onPress }: CategoryTagProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(category)}
      style={tw`bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1 mr-2 mb-2`}
      activeOpacity={0.7}
    >
      <ThemedText style={tw`text-xs text-blue-800 dark:text-blue-200`}>
        {category.attributes.title}
      </ThemedText>
    </TouchableOpacity>
  );
}
