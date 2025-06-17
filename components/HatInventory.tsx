import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { router } from 'expo-router';
import type { Hat } from '@/types';

interface HatInventoryProps {
  hats: Hat[];
  onDelete: (id: string) => void;
}

export default function HatInventory({ hats, onDelete }: HatInventoryProps) {
  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Hat',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(id) },
      ]
    );
  };

  const handleEdit = (hat: Hat) => {
    router.push({
      pathname: '/edit-hat',
      params: { hatId: hat.id, hatName: hat.name, hatImageUrl: hat.imageUrl || '' },
    });
  };

  const renderHat = ({ item }: { item: Hat }) => (
    <View style={styles.hatCard}>
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.hatImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}
      </View>
      
      <View style={styles.hatInfo}>
        <Text style={styles.hatName}>{item.name}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDelete(item.id, item.name)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (hats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No hats in your collection yet. Add some hats to get started!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={hats}
      keyExtractor={(item) => item.id}
      renderItem={renderHat}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 16,
  },
  hatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  hatImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 10,
  },
  hatInfo: {
    flex: 1,
  },
  hatName: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  editButtonText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});
