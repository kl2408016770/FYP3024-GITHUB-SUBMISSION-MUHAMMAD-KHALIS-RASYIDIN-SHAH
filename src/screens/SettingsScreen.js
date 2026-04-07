import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = ({ navigation: propNavigation }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, userData, updateUserData, logout } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userData?.displayName || user?.displayName || '');
  const [phone, setPhone] = useState(userData?.phone || '');

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    const result = await updateUserData({
      displayName: name,
      phone: phone
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'We will send a password reset email to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            setLoading(true);
            try {
              await sendPasswordResetEmail(auth, user.email);
              Alert.alert('Email Sent', 'Check your email for instructions');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, label, onPress, type = 'link', value, rightIcon = 'chevron-forward' }) => (
    
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={type === 'static'}
    >
      <View style={styles.settingLeft}>
        <Text style={[styles.settingIcon, { color: colors.primary }]}>{icon}</Text>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {type === 'link' && (
        <Ionicons name={rightIcon} size={20} color={colors.textLight} />
      )}
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      )}
      {type === 'static' && (
        <Text style={[styles.settingValue, { color: colors.textLight }]}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const displayName = userData?.displayName || user?.displayName || 'Update your name';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Summary */}
      <TouchableOpacity 
        style={[styles.profileCard, { backgroundColor: colors.card }]}
        onPress={() => setEditing(!editing)}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {firstLetter}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.textLight }]}>
            {user?.email}
          </Text>
        </View>
        <Ionicons name={editing ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textLight} />
      </TouchableOpacity>

      {/* Edit Form (shown when editing) */}
      {editing && (
        <View style={[styles.editSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textLight }]}>Display Name</Text>
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

          <View style={styles.editActions}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setEditing(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textLight }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.white }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Settings List */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <SettingItem 
          icon="🔒"
          label="Change Password"
          onPress={handleChangePassword}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <SettingItem 
          icon="🌙"
          label="Dark Mode"
          type="switch"
          value={isDarkMode}
          onPress={toggleTheme}
        />
        <SettingItem 
          icon="📱"
          label="App Version"
          type="static"
          value="1.0.0"
        />
      </View>

      {/* User Manual */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
  <TouchableOpacity 
    style={styles.settingItem}
    onPress={() => WebBrowser.openBrowserAsync('https://drive.google.com/file/d/1gSE7_32tF_nIhfpqOCAC7aiuUIDtbPDU/view?usp=sharing')}
  >
    <View style={styles.settingLeft}>
      <Text style={[styles.settingIcon, { color: colors.primary }]}>📖</Text>
      <Text style={[styles.settingLabel, { color: colors.text }]}>User Manual</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
  </TouchableOpacity>
</View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { borderColor: colors.error }]}
        onPress={() => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', onPress: () => logout(), style: 'destructive' }
            ]
          );
        }}
      >
        <Text style={[styles.logoutButtonText, { color: colors.error }]}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editSection: {
    marginHorizontal: 15,
    marginTop: -10,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  logoutButton: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 30,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 20,
  },
});

export default SettingsScreen;