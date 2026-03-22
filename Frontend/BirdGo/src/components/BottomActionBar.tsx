import React from 'react';
import {Pressable, type ViewStyle, View} from 'react-native';

import {styles} from '../appStyles';

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
        <View style={styles.cameraIconBody}>
          <View style={styles.cameraIconTop} />
          <View style={styles.cameraIconLensOuter}>
            <View style={styles.cameraIconLensInner} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
