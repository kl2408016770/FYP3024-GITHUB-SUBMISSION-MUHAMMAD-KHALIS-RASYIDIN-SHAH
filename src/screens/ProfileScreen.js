import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getUserPoints } from '../services/pointsService';
import { useFocusEffect } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';


const updateRoleToAdmin = async () => {
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, { role: 'admin' });
  Alert.alert('Success', 'Role updated to admin. Please log out and log back in.');
};

const ProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, userData, logout } = useAuth();
console.log('logout function exists?', typeof logout);
  const { getItemCount } = useCart();
  const [points, setPoints] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadPoints();
    }, [])
  );

  const loadPoints = async () => {
    const result = await getUserPoints(user.uid);
    if (result.success) {
      setPoints(result.points);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const displayName = userData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.white }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {firstLetter}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.white }]}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.white }]}>{user?.email}</Text>
        <Text style={[styles.memberSince, { color: colors.white + 'CC' }]}>
          Member since: {new Date(user?.metadata?.creationTime).toLocaleDateString()}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{getItemCount()}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Items in Cart</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Orders</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{points}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Points</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={[styles.menuSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>Order History</Text>
          <Text style={[styles.menuItemArrow, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('LoyaltyPoints')}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>
            Loyalty Points (⭐ {points})
          </Text>
          <Text style={[styles.menuItemArrow, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('AddressList')}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>📍 Delivery Addresses</Text>
          <Text style={[styles.menuItemArrow, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.menuItemText, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.menuItemArrow, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutButtonText, { color: colors.white }]}>Logout</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textLight }]}>Version 1.0.0</Text>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fffef9',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  menuSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemArrow: {
    fontSize: 18,
  },
  logoutButton: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
});

export default ProfileScreen;