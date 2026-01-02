import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (playlistsId: number[]) => void;
}

export default function SelectAlbumModal({ visible, onClose, onSelect }: Props) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Set<number>>(new Set());
  const [initialPlaylist, setInitialPlaylist] = useState<Set<number>>(new Set());
  const { listUserPlaylist, currentSongData } = useAudio();
  
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
        .filter(p =>
          p.songs.some(s => s.videoId === currentSongData.videoId)
        )
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

  // Manejo de agregar o quitar cancion de la playlist  
  const togglePlaylist = (id: number) => {
    console.log(selectedPlaylist)
    setSelectedPlaylist(prev => {
      const next = new Set(prev);
      // Si existe lo eliminamos
      // y sino lo agregamos
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
          <Pressable style={styles.container} onPress={() => {}}>
          <Text style={styles.title}>TUS PLAYLIST</Text>

          {listUserPlaylist.map(album => (
            <TouchableOpacity
              key={album.id}
              style={styles.radioRow}
              onPress={() => togglePlaylist(album.id)}
            > 
              <View style={{flex: 1, width: '100%'}}>
                <Text 
                numberOfLines={1}
                ellipsizeMode="tail" style={styles.radioText}>{album.name}</Text>
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
              disabled={selectedPlaylist === null || isDisabled}
            >
              <Text
                style={[
                  styles.confirm,
                  (selectedPlaylist === null || isDisabled) && { opacity: 0.5 },
                ]}
              >
                GUARDAR
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 350,
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
    marginBottom: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  radioText: {
    color: 'white',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopColor: '#444',
    borderTopWidth: 1,
    marginTop: 10
  },
  cancel: {
    color: 'gray',
    fontWeight: '600',
    marginRight: 20,
    fontSize: 13,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  confirm: {
    backgroundColor: '#FFD700',
    color: 'black',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 7,
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
});
