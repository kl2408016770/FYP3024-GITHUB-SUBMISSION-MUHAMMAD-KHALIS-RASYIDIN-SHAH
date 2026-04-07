import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const CartScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    clearCart 
  } = useCart();

  const [refreshing, setRefreshing] = useState(false);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Add some items to your cart first');
      return;
    }
    navigation.navigate('Checkout');
  }, [cartItems.length, navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleUpdateQuantity = useCallback((id, newQuantity) => {
    updateQuantity(id, newQuantity);
  }, [updateQuantity]);

  const handleRemove = useCallback((id) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(id), style: 'destructive' }
      ]
    );
  }, [removeFromCart]);

  const renderCartItem = ({ item }) => (
  <View style={[styles.cartItem, { backgroundColor: colors.card }]}>
    <Image 
      source={{ 
        uri: item.imageUrl || item.image || 'https://via.placeholder.com/80' 
      }} 
      style={styles.itemImage} 
    />
    
    <View style={styles.itemDetails}>
      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.itemPrice, { color: colors.primary }]}>
        RM {item.price.toFixed(2)}
      </Text>
      {item.instructions ? (
        <Text style={[styles.instructions, { color: colors.textLight }]} numberOfLines={1}>
          Note: {item.instructions}
        </Text>
      ) : null}
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={[styles.quantityButton, { backgroundColor: colors.primary }]}
          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
        
        <TouchableOpacity 
          style={[styles.quantityButton, { backgroundColor: colors.primary }]}
          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
        >
          <Text style={[styles.removeButtonText, { color: colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

  const renderEmpty = () => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.emptyText, { color: colors.textLight }]}>Your cart is empty</Text>
      <TouchableOpacity 
        style={[styles.shopButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={[styles.shopButtonText, { color: colors.white }]}>Browse Menu</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <View style={[styles.footer, { 
      backgroundColor: colors.card,
      borderTopColor: colors.border 
    }]}>
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
        <Text style={[styles.totalAmount, { color: colors.primary }]}>
          RM {getCartTotal().toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.clearButton, { 
            borderColor: colors.error,
            backgroundColor: colors.card
          }]}
          onPress={() => {
            Alert.alert(
              'Clear Cart',
              'Are you sure you want to remove all items?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: clearCart, style: 'destructive' }
              ]
            );
          }}
        >
          <Text style={[styles.clearButtonText, { color: colors.error }]}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleCheckout}
        >
          <Text style={[styles.checkoutButtonText, { color: colors.white }]}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return renderEmpty();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
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
      {renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cartList: {
    padding: 15,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
  },
  removeButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    marginLeft: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
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

export default CartScreen;