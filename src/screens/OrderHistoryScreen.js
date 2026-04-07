import React, { useState, useEffect, useCallback } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserOrders } from '../services/orderService';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveWaiterRequest } from '../services/waiterService';

const OrderHistoryScreen = ({ navigation, onNewOrders }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewedOrders, setViewedOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load viewed orders from storage
  useEffect(() => {
    loadViewedOrders();
  }, []);

  const loadViewedOrders = async () => {
    try {
      const stored = await AsyncStorage.getItem(`viewed_orders_${user.uid}`);
      if (stored) {
        setViewedOrders(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading viewed orders:', error);
    }
  };

  const saveViewedOrders = async (newViewed) => {
    try {
      await AsyncStorage.setItem(`viewed_orders_${user.uid}`, JSON.stringify(newViewed));
    } catch (error) {
      console.error('Error saving viewed orders:', error);
    }
  };

  const loadOrders = useCallback(async () => {
    const result = await getUserOrders(user.uid);
    if (result.success) {
      setOrders(result.orders);
      
      // Calculate new orders (status not pending and not viewed)
      const newOrders = result.orders.filter(order => 
        order.status !== 'pending' && !viewedOrders.includes(order.id)
      );
      
      const newOrdersCount = newOrders.length;
      onNewOrders?.(newOrdersCount);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user.uid, viewedOrders, onNewOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  // Mark all as viewed when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (orders.length > 0) {
        const allOrderIds = orders.map(o => o.id);
        setViewedOrders(prev => {
          const newViewed = [...new Set([...prev, ...allOrderIds])];
          saveViewedOrders(newViewed);
          return newViewed;
        });
        onNewOrders?.(0);
      }
    }, [orders, onNewOrders])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'processing': return colors.primary;
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return colors.textLight;
    }
  };

  const hasNewUpdate = useCallback((order) => {
    return order.status !== 'pending' && !viewedOrders.includes(order.id);
  }, [viewedOrders]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCallWaiter = useCallback((order) => {
  if (order.orderType !== 'dine-in') {
    Alert.alert('Info', 'Call waiter is only for dine-in orders');
    return;
  }

  Alert.alert(
    '👨‍🍳 Call Waiter',
    `Table ${order.tableNumber || 'N/A'} - What do you need?`,
    [
      { 
        text: '💧 More Water', 
        onPress: async () => {
          await saveWaiterRequest(order.tableNumber, 'more water', order.id);
          Alert.alert('✓ Request Sent', `Waiter has been notified: more water at Table ${order.tableNumber || 'N/A'}`);
        } 
      },
      { 
        text: '🧾 Request Bill', 
        onPress: async () => {
          await saveWaiterRequest(order.tableNumber, 'bill', order.id);
          Alert.alert('✓ Request Sent', `Waiter has been notified: bill at Table ${order.tableNumber || 'N/A'}`);
        } 
      },
      { 
        text: '❓ Assistance', 
        onPress: async () => {
          await saveWaiterRequest(order.tableNumber, 'assistance', order.id);
          Alert.alert('✓ Request Sent', `Waiter has been notified: assistance at Table ${order.tableNumber || 'N/A'}`);
        } 
      },
      { 
        text: '✕ Cancel', 
        style: 'cancel' 
      }
    ],
    { cancelable: true }
  );
}, []);

  const renderOrder = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <View>
            <Text style={[styles.orderNumber, { color: colors.text }]}>{item.orderNumber}</Text>
            <Text style={[styles.orderDate, { color: colors.textLight }]}>{formatDate(item.createdAt)}</Text>
          </View>
          {hasNewUpdate(item) && (
            <View style={[styles.newBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.newBadgeText, { color: colors.white }]}>NEW</Text>
            </View>
          )}
          
          {item.orderType === 'dine-in' && item.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.waiterButton, { backgroundColor: colors.primary }]}
              onPress={() => handleCallWaiter(item)}
            >
              <Text style={[styles.waiterButtonText, { color: colors.white }]}>👨‍🍳 Call Waiter</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.itemsPreview, { borderTopColor: colors.border }]}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <Text key={index} style={[styles.itemPreview, { color: colors.text }]} numberOfLines={1}>
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
        <Text style={[styles.totalAmount, { color: colors.primary }]}>RM {item.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  ), [colors, hasNewUpdate, handleCallWaiter, navigation]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyEmoji, { color: colors.textLight }]}>🛍️</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
      <Text style={[styles.emptyText, { color: colors.textLight }]}>Your order history will appear here</Text>
      <TouchableOpacity
        style={[styles.shopButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={[styles.shopButtonText, { color: colors.white }]}>Browse Menu</Text>
      </TouchableOpacity>
    </View>
  ), [colors, navigation]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {orders.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
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
        />
      )}
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
    marginBottom: 10,
  },
  orderHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  waiterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  waiterButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
  itemsPreview: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 10,
  },
  itemPreview: {
    fontSize: 14,
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;