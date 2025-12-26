import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
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
          <Text style={styles.title}>TUS PLAYLIST</Text>

          {listUserPlaylist.map(album => (
            <TouchableOpacity
              key={album.id}
              style={styles.radioRow}
              onPress={() => togglePlaylist(album.id)}
            > 
              <View style={{flex: 1, width: '100%'}}>
                <Text style={styles.radioText}>{album.name}</Text>
              </View>
              <View style={{height: 22, width: 22}}>
                {selectedPlaylist.has(album.id) ? (
                  <MaterialIcons  name="check-circle" size={23} color="#FFD700" />
                ) : (
                  <View style={styles.radioOuter}/>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>CANCELAR</Text>
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
                GUARDAR
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
    borderRadius: 15,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    borderBottomColor: '#444',
    borderBottomWidth: 1,
    paddingVertical: 15,
    marginBottom: 15,
  },
  radioRow: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  radioText: {
    color: '#bbb',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopColor: '#444',
    borderTopWidth: 1,
  },
  cancel: {
    color: '#999',
    marginRight: 20,
    fontSize: 13,
    paddingVertical: 15,
  },
  confirm: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 15,
  },
});
