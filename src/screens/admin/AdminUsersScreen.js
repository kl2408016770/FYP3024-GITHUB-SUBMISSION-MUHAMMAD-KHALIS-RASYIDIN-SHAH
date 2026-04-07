import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';  
import { getAllUsers, updateUserRole } from '../../services/userService';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AdminUsersScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  const loadUsers = useCallback(async () => {
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.users);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, [loadUsers]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const handlePromote = (user) => {
  const isCurrentlyAdmin = user.role?.trim() === 'admin';
  const newRole = isCurrentlyAdmin ? 'user' : 'admin';
  console.log('Current user (logged in):', userData?.id);
console.log('Target user (to modify):', user.id);
console.log('Are they the same?', userData?.id === user.id);
console.log('New role:', newRole);
  
  
  if (userData?.id === user.id) {
    Alert.alert('Cannot Modify Own Role', 'You cannot change your own admin status.');
    return;
  }
  
  Alert.alert(
    'Update Role',
    `Change ${user.displayName || user.email}'s role from ${user.role} to ${newRole}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          const result = await updateUserRole(user.id, newRole);
          if (result.success) {
            loadUsers();
          } else {
            Alert.alert('Error', result.error);
          }
        }
      }
    ]
  );
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderUser = ({ item }) => (
    <View style={[styles.userCard, { backgroundColor: colors.card }]}>
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.displayName?.charAt(0).toUpperCase() || item.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {item.displayName || 'No name'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textLight }]}>{item.email}</Text>
          <Text style={[styles.userMeta, { color: colors.textLight }]}>
            Joined {formatDate(item.createdAt)} • {item.points || 0} pts
          </Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? colors.success + '20' : colors.primary + '20' }]}
          onPress={() => handlePromote(item)}
        >
          <Text style={[styles.roleText, { color: item.role === 'admin' ? colors.success : colors.primary }]}>
            {item.role?.toUpperCase() || 'USER'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyEmoji, { color: colors.textLight }]}>👥</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No users found</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 2,
  },
  userMeta: {
    fontSize: 11,
  },
  userActions: {
    marginLeft: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default AdminUsersScreen;