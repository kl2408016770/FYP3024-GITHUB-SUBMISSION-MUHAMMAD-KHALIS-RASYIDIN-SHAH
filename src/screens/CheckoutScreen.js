import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { saveOrder } from '../services/orderService';
import { addPoints, calculatePointsFromOrder } from '../services/pointsService';
import { getUserAddresses } from '../services/addressService';
import { Ionicons } from '@expo/vector-icons';

const CheckoutScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [dineInMode, setDineInMode] = useState(true);
  const [tableNumber, setTableNumber] = useState('');

  const paymentMethods = [
    { id: 'cash', label: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' },
    { id: 'card', label: 'Credit / Debit Card', icon: '💳', description: 'Visa, Mastercard, Amex' },
    { id: 'fpx', label: 'FPX', icon: '🏦', description: 'Online banking' },
    { id: 'tng', label: 'Touch \'n Go eWallet', icon: '📱', description: 'Pay with TnG' },
    { id: 'grabpay', label: 'GrabPay', icon: '🟢', description: 'Pay with Grab' },
  ];

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const result = await getUserAddresses(user.uid);
    if (result.success) {
      setAddresses(result.addresses);
      const defaultAddr = result.addresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (result.addresses.length > 0) {
        setSelectedAddress(result.addresses[0]);
      }
    }
    setLoadingAddresses(false);
  };

  const handlePaymentSimulation = (method) => {
    const simulations = {
      cash: null,
      card: '💳 Card payment simulation - In a real app, you would enter your card details.',
      fpx: '🏦 FPX simulation - You would be redirected to your bank\'s login page.',
      tng: '📱 Touch \'n Go simulation - You would open the TnG app to authorize payment.',
      grabpay: '🟢 GrabPay simulation - You would be redirected to GrabPay to complete payment.'
    };

    if (simulations[method]) {
      Alert.alert('Demo Mode', simulations[method]);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (dineInMode && !tableNumber) {
      Alert.alert('Error', 'Please enter your table number');
      return;
    }

    if (!dineInMode && !selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    
    if (paymentMethod !== 'cash') {
      handlePaymentSimulation(paymentMethod);
    }

    setLoading(true);
    
    const total = getCartTotal();
    const pointsEarned = calculatePointsFromOrder(total);
    
    const orderData = {
      userId: user.uid,
      items: cartItems,
      total,
      paymentMethod,
      orderType: dineInMode ? 'dine-in' : 'takeaway',
      tableNumber: dineInMode ? tableNumber : null,
      address: !dineInMode ? selectedAddress : null
    };
    
    const result = await saveOrder(orderData);

    if (result.success) {
      await addPoints(user.uid, pointsEarned);
      clearCart();
      Alert.alert(
        '🎉 Order Placed!',
        `Your order #${result.orderNumber} has been placed successfully.\nYou earned ${pointsEarned} points!`,
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('OrderHistory')
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const renderOrderItem = (item) => (
    <View key={item.id} style={[styles.orderItem, { borderBottomColor: colors.border }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemQuantity, { color: colors.textLight }]}>x{item.quantity}</Text>
      </View>
      <Text style={[styles.itemPrice, { color: colors.text }]}>
        RM {(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  const pointsEarned = calculatePointsFromOrder(getCartTotal());

  const renderAddressSection = () => {
    if (loadingAddresses) {
      return (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (addresses.length === 0) {
      return (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          <View style={styles.noAddressContainer}>
            <Text style={[styles.noAddressText, { color: colors.textLight }]}>No delivery address saved</Text>
            <TouchableOpacity 
              style={[styles.addAddressButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddAddress', { onAddressAdded: loadAddresses })}
            >
              <Text style={[styles.addAddressButtonText, { color: colors.white }]}>+ Add Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddressList')}>
            <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.selectedAddress, { backgroundColor: colors.background }]}
          onPress={() => navigation.navigate('AddressList')}
        >
          <Text style={[styles.addressName, { color: colors.text }]}>{selectedAddress?.name}</Text>
          <Text style={[styles.addressPhone, { color: colors.textLight }]}>{selectedAddress?.phone}</Text>
          <Text style={[styles.addressDetail, { color: colors.text }]}>{selectedAddress?.address}</Text>
          <Text style={[styles.addressCity, { color: colors.textLight }]}>
            {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.postalCode}
          </Text>
          {selectedAddress?.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.defaultText, { color: colors.white }]}>DEFAULT</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Order Type Toggle */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Type</Text>
        <View style={styles.orderTypeContainer}>
          <TouchableOpacity
            style={[
              styles.orderTypeButton,
              { borderColor: colors.border },
              dineInMode && [styles.orderTypeSelected, { backgroundColor: colors.primary }]
            ]}
            onPress={() => setDineInMode(true)}
          >
            <Text style={[
              styles.orderTypeText,
              { color: colors.text },
              dineInMode && { color: colors.white }
            ]}>
              🍽️ Dine In
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.orderTypeButton,
              { borderColor: colors.border },
              !dineInMode && [styles.orderTypeSelected, { backgroundColor: colors.primary }]
            ]}
            onPress={() => setDineInMode(false)}
          >
            <Text style={[
              styles.orderTypeText,
              { color: colors.text },
              !dineInMode && { color: colors.white }
            ]}>
              🥡 Takeaway
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Number - Only show for Dine In */}
      {dineInMode && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Table Number</Text>
          <TextInput
            style={[styles.tableInput, { 
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="Enter your table number (e.g., 12)"
            placeholderTextColor={colors.textLight}
            value={tableNumber}
            onChangeText={setTableNumber}
            keyboardType="numeric"
          />
          <Text style={[styles.tableHint, { color: colors.textLight }]}>
            Your food will be served to your table
          </Text>
        </View>
      )}

      {/* Delivery Address Section - Only show for Takeaway */}
      {!dineInMode && renderAddressSection()}

      {/* Order Items */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Order</Text>
        {cartItems.map(renderOrderItem)}
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textLight }]}>Subtotal</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>RM {getCartTotal().toFixed(2)}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textLight }]}>Delivery Fee</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>RM 0.00</Text>
        </View>
        
        <View style={[styles.grandTotalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.grandTotalValue, { color: colors.primary }]}>RM {getCartTotal().toFixed(2)}</Text>
        </View>

        {/* Points Preview */}
        <View style={[styles.pointsPreview, { backgroundColor: colors.primary + '20' }]}>
          <Text style={styles.pointsEmoji}>⭐</Text>
          <Text style={[styles.pointsText, { color: colors.primary }]}>
            You'll earn {pointsEarned} points from this order!
          </Text>
        </View>
      </View>

      {/* Payment Methods */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
        
        {paymentMethods.map((method) => (
          <TouchableOpacity 
            key={method.id}
            style={[
              styles.paymentOption,
              { borderColor: colors.border },
              paymentMethod === method.id && [styles.selectedPayment, { 
                borderColor: colors.primary,
                backgroundColor: colors.primary + '10'
              }]
            ]}
            onPress={() => setPaymentMethod(method.id)}
          >
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <View>
                <Text style={[styles.paymentText, { color: colors.text }]}>{method.label}</Text>
                <Text style={[styles.paymentDescription, { color: colors.textLight }]}>
                  {method.description}
                </Text>
              </View>
            </View>
            {paymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Place Order Button */}
      <TouchableOpacity 
        style={[styles.placeOrderButton, { backgroundColor: colors.primary }]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.placeOrderText, { color: colors.white }]}>
            Place Order • RM {getCartTotal().toFixed(2)}
          </Text>
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
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  orderTypeSelected: {
    borderWidth: 1,
  },
  orderTypeText: {
    fontSize: 16,
  },
  tableInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  tableHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  selectedAddress: {
    padding: 15,
    borderRadius: 8,
    position: 'relative',
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
  addressDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressCity: {
    fontSize: 14,
  },
  defaultBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  noAddressContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noAddressText: {
    fontSize: 14,
    marginBottom: 10,
  },
  addAddressButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addAddressButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  pointsEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedPayment: {
    borderWidth: 2,
  },
  placeOrderButton: {
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 20,
  },
});

export default CheckoutScreen;