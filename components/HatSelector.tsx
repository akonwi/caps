import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import type { Hat } from '@/types';

interface HatSelectorProps {
  selectedHat: Hat | null;
  onSelect: () => void;
  hatsCount: number;
}

export default function HatSelector({ selectedHat, onSelect, hatsCount }: HatSelectorProps) {
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const imageSize = isMobile ? Math.min(screenWidth - 80, 200) : 200;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today&apos;s Hat</Text>
      
      <View style={styles.card}>
        {selectedHat ? (
          <>
            <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
              {selectedHat.imageUrl ? (
                <Image
                  source={{ uri: selectedHat.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No image</Text>
                </View>
              )}
            </View>
            <Text style={styles.hatName}>{selectedHat.name}</Text>
          </>
        ) : (
          <>
            <View style={[styles.placeholderImage, { width: imageSize, height: imageSize }]}>
              <Text style={styles.placeholderText}>No hat selected</Text>
            </View>
            {hatsCount === 0 && (
              <Text style={styles.emptyMessage}>Add some hats to the collection</Text>
            )}
          </>
        )}
        
        <TouchableOpacity
          style={[styles.button, hatsCount === 0 && styles.buttonDisabled]}
          onPress={onSelect}
          disabled={hatsCount === 0}
        >
          <Text style={[styles.buttonText, hatsCount === 0 && styles.buttonTextDisabled]}>
            Pick a hat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Don't use flex: 1 here - let it size to content
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  hatName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
