import { useAudio } from '@/contexts/PlayerContext';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../mytext';

interface Props {
    visible: boolean;
    onClose: () => void;
    OnConfirm: () => void;
}

export default function SelectAlbumModal({ visible, onClose, OnConfirm }: Props) {  
  const { PlayerHeight, tabBarHeight} = useAudio();

  return (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
    <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, {marginBottom: PlayerHeight + tabBarHeight}]} onPress={() => {}}>
        <Text style={styles.title}>
            ¿Estas seguro que deseas eliminar esta playlist?
        </Text>

        <Text style={styles.description}>
            Esta acción no se puede deshacer.{"\n"}
            Se borrará permanentemente.
        </Text>

        <View style={styles.actions}>
            <Pressable onPress={onClose}>
            <Text style={styles.cancel}>CANCELAR</Text>
            </Pressable>

            <Pressable onPress={OnConfirm}>
            <Text style={styles.confirm}>ELIMINAR</Text>
            </Pressable>
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
    width: '90%',
    maxWidth: 350,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    color: '#bbb',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancel: {
    color: 'gray',
    fontWeight: '600',
    marginRight: 10,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  confirm: {
    backgroundColor: 'red',
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
});
