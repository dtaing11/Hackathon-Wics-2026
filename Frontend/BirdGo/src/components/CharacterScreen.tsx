import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';

import {styles} from '../appStyles';

type CharacterScreenProps = {
  onClose: () => void;
  visible: boolean;
};

export function CharacterScreen({
  onClose,
  visible,
}: CharacterScreenProps) {
  return (
    <Modal animationType="slide" visible={visible}>
      <View style={styles.characterScreen}>
        <View style={styles.characterScreenHeader}>
          <Text style={styles.characterScreenTitle}>Character</Text>
          <Text style={styles.characterScreenSubtitle}>
            This is a separate screen placeholder for your character flow.
          </Text>
        </View>

        <View style={styles.characterScreenBody}>
          <Text style={styles.characterScreenBodyText}>
            We can turn this into stats, inventory, quests, customization, or profile
            details next.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close character screen"
          onPress={onClose}
          style={styles.characterScreenCloseButton}>
          <Text style={styles.characterScreenCloseButtonText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
