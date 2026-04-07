import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { hasUserReviewed } from '../services/reviewService';
import { Ionicons } from '@expo/vector-icons';

const OrderDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { order } = route.params;
  const { addToCart, cartItems } = useCart();
  const [reviewedItems, setReviewedItems] = useState({});

  const checkReviewed = useCallback(async () => {
    const reviewed = {};
    for (const item of order.items) {
      const result = await hasUserReviewed(user.uid, item.id, order.id);
      if (result.success) {
        reviewed[item.id] = result.reviewed;
      }
    }
    setReviewedItems(reviewed);
  }, [user.uid, order.id, order.items]);

  useEffect(() => {
    checkReviewed();
  }, [checkReviewed]);

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReorder = useCallback(() => {
    const existingItems = cartItems.filter(cartItem => 
      order.items.some(orderItem => orderItem.id === cartItem.id)
    );

    if (existingItems.length > 0) {
      Alert.alert(
        'Items Already in Cart',
        'Some items from this order are already in your cart. Do you want to add them again?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Anyway', 
            onPress: () => addAllItemsToCart()
          }
        ]
      );
    } else {
      addAllItemsToCart();
    }
  }, [cartItems, order.items]);

  const addAllItemsToCart = useCallback(() => {
    order.items.forEach(item => {
      const product = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category
      };
      addToCart(product, item.quantity, '');
    });

    Alert.alert(
      '✓ Reorder Successful',
      `${order.items.reduce((sum, item) => sum + item.quantity, 0)} items added to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  }, [order.items, addToCart, navigation]);

  const renderOrderItem = useCallback((item, index) => (
    <View key={index} style={[styles.orderItem, { borderBottomColor: colors.border }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemQuantity, { color: colors.textLight }]}>x{item.quantity}</Text>
      </View>
      <View style={styles.itemPriceContainer}>
        <Text style={[styles.itemPrice, { color: colors.text }]}>
          RM {(item.price * item.quantity).toFixed(2)}
        </Text>
        <Text style={[styles.itemUnitPrice, { color: colors.textLight }]}>
          RM {item.price.toFixed(2)} each
        </Text>

        {order.status === 'completed' && (
          <TouchableOpacity 
            style={[
              styles.reviewButton,
              { 
                backgroundColor: reviewedItems[item.id] ? colors.success + '20' : colors.primary + '20'
              }
            ]}
            onPress={() => {
              if (reviewedItems[item.id]) {
                Alert.alert('Already Reviewed', 'You have already reviewed this item');
              } else {
                navigation.navigate('AddReview', { order, product: item });
              }
            }}
            disabled={reviewedItems[item.id]}
          >
            <Ionicons 
              name={reviewedItems[item.id] ? 'checkmark-circle' : 'star-outline'} 
              size={16} 
              color={reviewedItems[item.id] ? colors.success : colors.primary} 
            />
            <Text style={[
              styles.reviewText,
              { color: reviewedItems[item.id] ? colors.success : colors.primary }
            ]}>
              {reviewedItems[item.id] ? 'Reviewed' : 'Write Review'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [colors, reviewedItems, order.status, navigation]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border 
      }]}>
        <View style={styles.orderNumberContainer}>
          <Text style={[styles.orderNumberLabel, { color: colors.textLight }]}>Order Number</Text>
          <Text style={[styles.orderNumber, { color: colors.text }]}>{order.orderNumber}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Date</Text>
        <Text style={[styles.orderDate, { color: colors.textLight }]}>{formatDate(order.createdAt)}</Text>
      </View>

      {order.orderType === 'dine-in' && order.tableNumber && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Table Number</Text>
          <View style={[styles.tableNumberContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.tableNumber, { color: colors.primary }]}>Table {order.tableNumber}</Text>
            <Text style={[styles.tableNote, { color: colors.textLight }]}>
              Your food will be served to this table
            </Text>
          </View>
        </View>
      )}

      {order.address && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          <View style={[styles.addressContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.addressName, { color: colors.text }]}>{order.address.name}</Text>
            <Text style={[styles.addressPhone, { color: colors.textLight }]}>{order.address.phone}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{order.address.address}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {order.address.city}, {order.address.state} {order.address.postalCode}
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Items ({order.items.length})
        </Text>
        {order.items.map(renderOrderItem)}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textLight }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>RM {order.total.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textLight }]}>Delivery Fee</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>RM 0.00</Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>RM {order.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
        <View style={[styles.paymentMethodContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.paymentMethod, { color: colors.text }]}>
            {order.paymentMethod === 'cash' ? '💰 Cash on Delivery' : '💳 Card Payment'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.reorderButton, { backgroundColor: colors.primary }]}
        onPress={handleReorder}
      >
        <Text style={[styles.reorderButtonText, { color: colors.white }]}>
          🔄 Reorder ({order.items.reduce((sum, item) => sum + item.quantity, 0)} items)
        </Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  orderNumberContainer: {
    flex: 1,
  },
  orderNumberLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
  },
  tableNumberContainer: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  tableNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tableNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  addressContainer: {
    padding: 15,
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemUnitPrice: {
    fontSize: 11,
    marginTop: 2,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  reviewText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentMethodContainer: {
    padding: 12,
    borderRadius: 8,
  },
  paymentMethod: {
    fontSize: 14,
  },
  reorderButton: {
    marginHorizontal: 15,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 30,
  },
});

export default OrderDetailScreen;