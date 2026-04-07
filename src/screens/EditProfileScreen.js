import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../services/firebase';
import { updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    }, 1000);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'We will send a password reset email to your registered email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            setLoading(true);
            try {
              await sendPasswordResetEmail(auth, user.email);
              Alert.alert('Email Sent', 'Check your email for password reset instructions');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={16} color={colors.white} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.textLight }]}>Name</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text
          }]}
          placeholder="Enter your name"
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.textLight, marginTop: 15 }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text
          }]}
          placeholder="Enter your phone number"
          placeholderTextColor={colors.textLight}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.textLight, marginTop: 15 }]}>Email</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
            opacity: 0.7
          }]}
          value={user?.email}
          editable={false}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleChangePassword}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="lock-closed" size={20} color={colors.primary} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.updateButton, { backgroundColor: colors.primary }]}
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.updateButtonText, { color: colors.white }]}>Update Profile</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  updateButton: {
    margin: 15,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 30,
  },
});

export default EditProfileScreen;