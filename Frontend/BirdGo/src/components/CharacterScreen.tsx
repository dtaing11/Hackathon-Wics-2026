import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {styles} from '../appStyles';
import {loginUser, registerUser} from '../services/authApi';
import {getMyPosts, type PostRecord} from '../services/postsApi';

type CharacterScreenProps = {
  onClose: () => void;
  onLoginStateChange: (username: string) => void;
  visible: boolean;
};

type AuthMode = 'login' | 'register';

export function CharacterScreen({
  onClose,
  onLoginStateChange,
  visible,
}: CharacterScreenProps) {
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [myPosts, setMyPosts] = useState<PostRecord[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);

  const submitLabel = useMemo(
    () => (mode === 'login' ? 'Log In' : 'Create Account'),
    [mode],
  );

  const loadMyPosts = async () => {
    setIsGalleryLoading(true);

    try {
      const posts = await getMyPosts();
      setMyPosts(posts);
    } catch {
      setMyPosts([]);
    } finally {
      setIsGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    loadMyPosts().catch(() => null);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setStatusMessage(null);
    }
  }, [visible]);

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStatusMessage(null);
  };

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim() || (mode === 'register' && !email.trim())) {
      setStatusMessage('Fill in all required fields first.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (mode === 'register') {
        await registerUser({
          email: email.trim(),
          username: username.trim(),
          password,
        });
        setStatusMessage('Account created. You can log in now.');
        setMode('login');
        return;
      }

      await loginUser({
        username: username.trim(),
        password,
      });
      const nextUsername = username.trim();
      setLoggedInUsername(nextUsername);
      onLoginStateChange(nextUsername);
      setStatusMessage('Login successful.');
      await loadMyPosts();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible}>
      <View style={styles.characterScreen}>
        <ScrollView
          contentContainerStyle={styles.characterScreenScroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.characterScreenHeader}>
            <Text style={styles.characterScreenTitle}>Account</Text>
            <Text style={styles.characterScreenSubtitle}>
              {loggedInUsername
                ? 'Login and Post Gallery'
                : 'Log in or register so you can post and explore'}
            </Text>
          </View>

          {loggedInUsername ? (
            <View style={styles.authWelcomeCard}>
              <Text style={styles.authWelcomeEyebrow}>Welcome</Text>
              <Text style={styles.authWelcomeUsername}>{loggedInUsername}</Text>
              {statusMessage ? (
                <Text style={styles.authStatusText}>{statusMessage}</Text>
              ) : null}
            </View>
          ) : (
            <>
              <View style={styles.authModeRow}>
                <Pressable
                  onPress={() => handleModeChange('login')}
                  style={[
                    styles.authModeButton,
                    mode === 'login' && styles.authModeButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.authModeButtonText,
                      mode === 'login' && styles.authModeButtonTextActive,
                    ]}>
                    Login
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleModeChange('register')}
                  style={[
                    styles.authModeButton,
                    mode === 'register' && styles.authModeButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.authModeButtonText,
                      mode === 'register' && styles.authModeButtonTextActive,
                    ]}>
                    Register
                  </Text>
                </Pressable>
              </View>

              <View style={styles.authCard}>
                {mode === 'register' ? (
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.authInput}
                  />
                ) : null}

                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  style={styles.authInput}
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  style={styles.authInput}
                />

                {statusMessage ? (
                  <Text style={styles.authStatusText}>{statusMessage}</Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={submitLabel}
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                  style={[
                    styles.authSubmitButton,
                    isSubmitting && styles.followButtonDisabled,
                  ]}>
                  <Text style={styles.authSubmitButtonText}>
                    {isSubmitting ? 'Working...' : submitLabel}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          <View style={styles.gallerySection}>
            <View style={styles.gallerySectionHeader}>
              <Text style={styles.gallerySectionTitle}>My Posts</Text>
              <Text style={styles.gallerySectionSubtitle}>
                Your uploaded bird posts only
              </Text>
            </View>

            {isGalleryLoading ? (
              <Text style={styles.galleryStatusText}>Loading posts...</Text>
            ) : null}

            {!isGalleryLoading && myPosts.length === 0 ? (
              <Text style={styles.galleryStatusText}>
                No posts yet. Log in and upload a bird to see it here.
              </Text>
            ) : null}

            <View style={styles.galleryGrid}>
              {myPosts.map(post => (
                <View key={post.postId} style={styles.galleryTile}>
                  <Image
                    source={{uri: post.imageUrl}}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

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
