import React from 'react';
import {Image, Pressable, type ViewStyle, View} from 'react-native';

import {styles} from '../appStyles';
import cameraButton from '../../Camera_Button.png';

type BottomActionBarProps = {
  busy?: boolean;
  onCameraPress: () => void;
  style?: ViewStyle;
};

export function BottomActionBar({
  busy = false,
  onCameraPress,
  style,
}: BottomActionBarProps) {
  return (
    <View style={[styles.bottomBar, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open camera"
        style={[styles.bottomBarButton, busy && styles.bottomBarButtonDisabled]}
        disabled={busy}
        onPress={onCameraPress}>
        <View style={styles.cameraButtonCircle}>
          <Image
            source={cameraButton}
            style={styles.cameraButtonImage}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    </View>
  );
}
