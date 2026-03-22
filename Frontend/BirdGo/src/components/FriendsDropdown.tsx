import React, {useEffect, useRef, useState} from 'react';
import {Animated, Pressable, Text, TextInput, View} from 'react-native';

import {styles} from '../appStyles';

type FriendItem = {
  online: boolean;
  username: string;
};

const FRIENDS = require('../data/friends.json') as FriendItem[];
const LOUISIANA_BIRDS = [
  'Brown Pelican',
  'Great Egret',
  'Roseate Spoonbill',
  'Yellow-crowned Night Heron',
  'Red-winged Blackbird',
  'Prothonotary Warbler',
];

function getFakeLastOnlineHours(username: string, index: number) {
  const seed =
    username.split('').reduce((total, char) => total + char.charCodeAt(0), 0) +
    index * 7;
  return (seed % 11) + 1;
}

function getFakeLastCaughtBird(username: string, index: number) {
  const seed =
    username.split('').reduce((total, char) => total + char.charCodeAt(0), 0) +
    index * 11;
  return LOUISIANA_BIRDS[seed % LOUISIANA_BIRDS.length];
}

type FriendsDropdownProps = {
  onToggle: () => void;
  open: boolean;
};

export function FriendsDropdown({
  onToggle,
  open,
}: FriendsDropdownProps) {
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (open) {
      drawerAnimation.stopAnimation();
      drawerAnimation.setValue(0);
      Animated.timing(drawerAnimation, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [drawerAnimation, open]);

  useEffect(() => {
    if (!open) {
      setIsAddFriendOpen(false);
      setSearchText('');
    }
  }, [open]);

  const handleAddFriendToggle = () => {
    setIsAddFriendOpen(current => !current);
  };

  return (
    <>
      <View style={styles.friendsDropdownWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open friends list"
          onPress={onToggle}
          style={[
            styles.secondaryMapButton,
            open && styles.secondaryMapButtonActive,
          ]}>
          <Text
            style={[
              styles.secondaryMapButtonText,
              open && styles.secondaryMapButtonTextActive,
            ]}>
            Friends
          </Text>
        </Pressable>
      </View>

      {open ? (
        <>
          <Pressable style={styles.friendsDrawerBackdrop} onPress={onToggle} />
          <Animated.View
            style={[
              styles.friendsDrawer,
              {
                opacity: drawerAnimation,
                transform: [
                  {
                    translateY: drawerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-18, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.friendsDrawerHeader}>
              <View style={styles.friendsDrawerHeaderRow}>
                <Text style={styles.friendsDrawerTitle}>Friends</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add friend"
                  onPress={handleAddFriendToggle}
                  style={styles.addFriendButton}>
                  <Text style={styles.addFriendButtonText}>+</Text>
                </Pressable>
              </View>

              {isAddFriendOpen ? (
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search username"
                  placeholderTextColor="#94a3b8"
                  style={styles.addFriendSearchInput}
                />
              ) : null}
            </View>

            <View style={styles.friendsDrawerList}>
              {FRIENDS.map((friend, index) => (
                <View key={friend.username} style={styles.friendDrawerRow}>
                  <View
                    style={[
                      styles.friendStatusDot,
                      friend.online && styles.friendStatusDotOnline,
                    ]}
                  />
                  <View style={styles.friendMeta}>
                    <View style={styles.friendTopRow}>
                      <Text style={styles.friendUsername}>{friend.username}</Text>
                      <Text style={styles.friendCatchText}>
                        Last caught - {getFakeLastCaughtBird(friend.username, index)}
                      </Text>
                    </View>
                    <Text style={styles.friendLastOnline}>
                      {friend.online
                        ? 'Online now'
                        : `Last online ${getFakeLastOnlineHours(friend.username, index)}h ago`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </>
      ) : null}
    </>
  );
}
