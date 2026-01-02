import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import HatSelector from "@/components/HatSelector";
import HatInventory from "@/components/HatInventory";
import { useData } from "@/hooks/useData";
import { eventEmitter, HatEvents } from "@/utils/events";
import type { Hat, HatAddedEvent, HatUpdatedEvent } from "@/types";

export default function HomeScreen() {
  const {
    hats,
    selectedHat,
    lastSelectedIds,
    isLoading,
    add,
    bulkAdd,
    delete: deleteHat,
    update,
    setSelectedHat,
    updateLastSelectedIds,
    clearAll,
  } = useData();
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width,
  );

  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  // Listen for hat events
  useEffect(() => {
    const handleHatAdded = ({ hat }: HatAddedEvent) => {
      add(hat).catch(console.error);
    };

    const handleHatUpdated = ({ hat }: HatUpdatedEvent) => {
      update(hat).catch(console.error);
    };

    eventEmitter.on(HatEvents.HAT_ADDED, handleHatAdded);
    eventEmitter.on(HatEvents.HAT_UPDATED, handleHatUpdated);

    return () => {
      eventEmitter.removeListener(HatEvents.HAT_ADDED, handleHatAdded);
      eventEmitter.removeListener(HatEvents.HAT_UPDATED, handleHatUpdated);
    };
  }, [add, update]);

  const selectRandomHat = async () => {
    if (hats.length === 0) {
      setSelectedHat(null);
      return;
    }

    if (hats.length === 1) {
      setSelectedHat(hats[0]);
      return;
    }

    // Filter out recently selected hats
    const availableHats = hats.filter(
      (hat) => !lastSelectedIds.includes(hat.id),
    );

    if (availableHats.length === 0) {
      // If all hats were recently selected, use all hats
      const randomIndex = Math.floor(Math.random() * hats.length);
      setSelectedHat(hats[randomIndex]);
      await updateLastSelectedIds([hats[randomIndex].id]);
      return;
    }

    // Select random hat from available ones
    const randomIndex = Math.floor(Math.random() * availableHats.length);
    const newSelectedHat = availableHats[randomIndex];
    setSelectedHat(newSelectedHat);

    // Update last selected IDs (keep max 7)
    const newLastSelectedIds = [...lastSelectedIds];
    if (newLastSelectedIds.length >= 7) {
      newLastSelectedIds.shift();
    }
    newLastSelectedIds.push(newSelectedHat.id);
    await updateLastSelectedIds(newLastSelectedIds);
  };

  const showDataMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Import Collection", "Export Collection"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            importCollection();
          } else if (buttonIndex === 2) {
            exportCollection();
          }
        },
      );
    } else {
      Alert.alert("Data Options", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        { text: "Import Collection", onPress: importCollection },
        { text: "Export Collection", onPress: exportCollection },
      ]);
    }
  };

  const exportCollection = async () => {
    try {
      const exportData = JSON.stringify({ hats, lastSelectedIds }, null, 2);
      const fileName = `caps-${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, exportData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export Hat Collection",
        });
      } else {
        Alert.alert("Success", `Collection exported to ${fileName}`);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export collection");
    }
  };

  const importCollection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(
          result.assets[0].uri,
        );
        const importedData = JSON.parse(fileContent);

        if (!importedData.hats || !Array.isArray(importedData.hats)) {
          Alert.alert("Error", "Invalid file format");
          return;
        }

        // Clear existing collection
        await clearAll();

        // Bulk add all imported hats
        await bulkAdd(importedData.hats);

        // Update lastSelectedIds
        await updateLastSelectedIds(importedData.lastSelectedIds || []);

        // Update selected hat if possible
        if (importedData.lastSelectedIds?.length > 0) {
          const lastId =
            importedData.lastSelectedIds[
              importedData.lastSelectedIds.length - 1
            ];
          const lastHat = importedData.hats.find((h: Hat) => h.id === lastId);
          setSelectedHat(lastHat || null);
        } else {
          setSelectedHat(null);
        }

        Alert.alert("Success", `Imported ${importedData.hats.length} hats`);
      }
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert("Error", "Failed to import collection");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.grid, screenWidth >= 768 && styles.gridDesktop]}>
          <View
            style={[
              styles.selectorSection,
              screenWidth >= 768 && styles.selectorSectionDesktop,
            ]}
          >
            <HatSelector
              selectedHat={selectedHat}
              onSelect={selectRandomHat}
              hatsCount={hats.length}
            />
          </View>

          <View
            style={[
              styles.inventorySection,
              screenWidth >= 768 && styles.inventorySectionDesktop,
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Collection</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.dataButton}
                  onPress={showDataMenu}
                >
                  <Text style={styles.dataButtonText}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push("/add-hat")}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <HatInventory hats={hats} onDelete={deleteHat} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  grid: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
  },
  gridDesktop: {
    flexDirection: 'row',
    gap: 24,
  },
  selectorSection: {
    // Mobile: no flex, size to content
  },
  selectorSectionDesktop: {
    flex: 1,
  },
  inventorySection: {
    flex: 1,
    minHeight: 0,
  },
  inventorySectionDesktop: {
    flex: 1,
    minHeight: 'auto',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  dataButton: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dataButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});
