import React, { useState, useCallback, useEffect } from 'react';
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
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AdminOrdersScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    const result = await getAllOrders();
    if (result.success) {
      setOrders(result.orders);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const handleStatusUpdate = (order) => {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    Alert.alert(
      'Update Order Status',
      `Change status from ${order.status.toUpperCase()} to ${nextStatus.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            const result = await updateOrderStatus(order.id, nextStatus);
            if (result.success) {
              loadOrders();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'processing': return colors.primary;
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return colors.textLight;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            {item.orderNumber}
          </Text>
          <Text style={[styles.orderDate, { color: colors.textLight }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}
          onPress={() => handleStatusUpdate(item)}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customerInfo}>
        <Text style={[styles.customerName, { color: colors.text }]}>
          {item.address?.name || 'Dine-in'}
        </Text>
        <Text style={[styles.customerEmail, { color: colors.textLight }]}>
          {item.orderType === 'dine-in' ? `Table ${item.tableNumber}` : 'Takeaway'}
        </Text>
      </View>

      <View style={styles.itemsPreview}>
        {item.items.slice(0, 2).map((orderItem, idx) => (
          <Text key={idx} style={[styles.itemPreview, { color: colors.textLight }]} numberOfLines={1}>
            {orderItem.quantity}x {orderItem.name}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={[styles.moreItems, { color: colors.primary }]}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.textLight }]}>Total:</Text>
        <Text style={[styles.totalAmount, { color: colors.primary }]}>
          RM {item.total.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyEmoji, { color: colors.textLight }]}>📦</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders found</Text>
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
        data={orders}
        renderItem={renderOrder}
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
  orderCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerInfo: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  customerEmail: {
    fontSize: 12,
  },
  itemsPreview: {
    marginBottom: 8,
  },
  itemPreview: {
    fontSize: 12,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
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

export default AdminOrdersScreen;