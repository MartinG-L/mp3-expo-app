import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../mytext';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (playlistsId: number[]) => void;
}

export default function SelectAlbumModal({ visible, onClose, onSelect }: Props) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Set<number>>(new Set());
  const [initialPlaylist, setInitialPlaylist] = useState<Set<number>>(new Set());
  const { listUserPlaylist, currentSongData, tabBarHeight, PlayerHeight } = useAudio();
  
  const isDisabled =
  selectedPlaylist.size === initialPlaylist.size &&
  [...selectedPlaylist].every(id => initialPlaylist.has(id));

  useEffect(() => {
    if (!currentSongData) {
      setSelectedPlaylist(new Set());
      return;
    }
    const initial = new Set(
      listUserPlaylist
        .filter(p => p.songs.some(s => s.videoId === currentSongData.videoId))
        .map(p => p.id)
    );
    setSelectedPlaylist(initial);
    setInitialPlaylist(new Set(initial));
  }, [currentSongData, listUserPlaylist, visible]);

  const handleConfirm = () => {
    if (selectedPlaylist !== null) {
      onSelect(Array.from(selectedPlaylist));
      onClose();
    }
  };

  const togglePlaylist = (id: number) => {
    setSelectedPlaylist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { marginBottom: tabBarHeight + PlayerHeight }]}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerAccent} />
            <Text style={styles.title}>Tus playlists</Text>
          </View>

          {/* Playlists */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {listUserPlaylist.map((album, index) => {
              const selected = selectedPlaylist.has(album.id);
              return (
                <TouchableOpacity
                  key={album.id}
                  style={[
                    styles.radioRow,
                    selected && styles.radioRowSelected,
                    index === listUserPlaylist.length - 1 && { marginBottom: 0 },
                  ]}
                  onPress={() => togglePlaylist(album.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioTextWrap}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.radioText, selected && styles.radioTextSelected]}>
                      {album.name}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={selected ? 'check-circle' : 'radio-button-unchecked'}
                    size={20}
                    color={selected ? '#FFD700' : '#444'}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, isDisabled && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={isDisabled}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '82%',
    maxWidth: 300,
    backgroundColor: '#141414',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    gap: 10,
  },
  headerAccent: {
    width: 3,
    height: 16,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Lista
  list: {
    maxHeight: 220,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  radioRowSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.07)',
  },
  radioTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  radioText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  cancelText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#FFD700',
  },
  confirmBtnDisabled: {
    opacity: 0.35,
  },
  confirmText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
});