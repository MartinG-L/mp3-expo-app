import { useAudio } from '@/contexts/PlayerContext';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (playlistsId: number[]) => void;
}

export default function SelectAlbumModal({ visible, onClose, onSelect }: Props) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Set<number>>(new Set());
  const { listUserPlaylist, currentSongData } = useAudio();

  

  useEffect(() => {
    if (!currentSongData) {
      setSelectedPlaylist(new Set());
      return;
    }

    const selected = listUserPlaylist
      .filter(p =>
        p.songs.some(s => s.videoId === currentSongData?.videoId)
      )
      .map(p => p.id);
    setSelectedPlaylist(new Set(selected));
  }, [currentSongData, listUserPlaylist]);

    const handleConfirm = () => {
      if (selectedPlaylist !== null) {
        onSelect(Array.from(selectedPlaylist));
        onClose();
      }
    };

  // Manejo de agregar o quitar cancion de la playlist  
  const togglePlaylist = (id: number) => {
    setSelectedPlaylist(prev => {
      const next = new Set(prev);

      // Si existe lo eliminamos
      // y sino lo agregamos
      if (next.has(id)) {
        next.delete(id); 
      } else {
        next.add(id); 
      }

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
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Seleciona una Playlist</Text>

          {listUserPlaylist.map(album => (
            <TouchableOpacity
              key={album.id}
              style={styles.radioRow}
              onPress={() => togglePlaylist(album.id)}
            >
              <View style={styles.radioOuter}>
                {selectedPlaylist.has(album.id) && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.radioText}>{album.name}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={selectedPlaylist === null }
            >
              <Text
                style={[
                  styles.confirm,
                  selectedPlaylist === null && { opacity: 0.5 },
                ]}
              >
                Guardar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#bbb',
  },
  radioText: {
    color: '#bbb',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  cancel: {
    color: '#999',
    marginRight: 20,
    fontSize: 15,
  },
  confirm: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '600',
  },
});
