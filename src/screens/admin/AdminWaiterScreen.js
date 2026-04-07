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
import { getWaiterRequests, markRequestResolved, deleteWaiterRequest } from '../../services/waiterService';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


const AdminWaiterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    const result = await getWaiterRequests();
    if (result.success) {
      setRequests(result.requests);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const handleResolve = (request) => {
    Alert.alert(
      'Resolve Request',
      `Mark this request as resolved?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            const result = await markRequestResolved(request.id);
            if (result.success) {
              loadRequests();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleDelete = (request) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteWaiterRequest(request.id);
            if (result.success) {
              loadRequests();
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
    return date.toLocaleString('en-MY', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  };

  const getRequestIcon = (type) => {
    switch (type) {
      case 'more water': return '💧';
      case 'order more': return '🍽️';
      case 'bill': return '🧾';
      case 'assistance': return '❓';
      default: return '📢';
    }
  };

  const renderRequest = ({ item }) => (
    <View style={[styles.requestCard, { backgroundColor: colors.card }]}>
      <View style={styles.requestHeader}>
        <View style={styles.tableInfo}>
          <Text style={[styles.tableNumber, { color: colors.primary }]}>
            Table {item.tableNumber || 'N/A'}
          </Text>
          <Text style={[styles.requestType, { color: colors.text }]}>
            {getRequestIcon(item.requestType)} {item.requestType}
          </Text>
        </View>
        <View style={styles.actions}>
          {item.status !== 'resolved' && (
            <TouchableOpacity onPress={() => handleResolve(item)} style={styles.resolveButton}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.timestamp, { color: colors.textLight }]}>
        {formatDate(item.createdAt)}
      </Text>
      {item.status === 'resolved' && (
        <View style={[styles.resolvedBadge, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.resolvedText, { color: colors.success }]}>Resolved</Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyEmoji, { color: colors.textLight }]}>🛎️</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No waiter requests</Text>
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
        data={requests}
        renderItem={renderRequest}
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
  requestCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestType: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolveButton: {
    marginRight: 12,
  },
  deleteButton: {},
  timestamp: {
    fontSize: 12,
    marginBottom: 8,
  },
  resolvedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolvedText: {
    fontSize: 11,
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

export default AdminWaiterScreen;