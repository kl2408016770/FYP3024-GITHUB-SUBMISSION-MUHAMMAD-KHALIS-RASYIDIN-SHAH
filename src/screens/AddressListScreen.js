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
import { useAuth } from '../context/AuthContext';
import { getUserAddresses, deleteAddress, setDefaultAddress } from '../services/addressService';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const AddressListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAddresses = useCallback(async () => {
    const result = await getUserAddresses(user.uid);
    if (result.success) {
      setAddresses(result.addresses);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user.uid]);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAddresses();
  }, [loadAddresses]);

  const handleDelete = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAddress(addressId);
            if (result.success) {
              loadAddresses();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    const result = await setDefaultAddress(user.uid, addressId);
    if (result.success) {
      loadAddresses();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderAddress = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.addressCard, 
        { 
          backgroundColor: colors.card,
          borderColor: item.isDefault ? colors.primary : colors.border,
          borderWidth: item.isDefault ? 2 : 1
        }
      ]}
      onPress={() => navigation.navigate('AddAddress', { 
        address: item,
        onAddressAdded: loadAddresses 
      })}
    >
      {item.isDefault && (
        <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.defaultText, { color: colors.white }]}>DEFAULT</Text>
        </View>
      )}
      
      <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.phone, { color: colors.textLight }]}>{item.phone}</Text>
      <Text style={[styles.address, { color: colors.text }]}>{item.address}</Text>
      <Text style={[styles.city, { color: colors.textLight }]}>
        {item.city}, {item.state} {item.postalCode}
      </Text>
      
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
        
        {!item.isDefault && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={[styles.defaultButtonText, { color: colors.primary }]}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyEmoji, { color: colors.textLight }]}>📍</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No addresses yet</Text>
      <Text style={[styles.emptyText, { color: colors.textLight }]}>Add your first delivery address</Text>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddAddress', { onAddressAdded: loadAddresses })}
      >
        <Text style={[styles.addButtonText, { color: colors.white }]}>Add Address</Text>
      </TouchableOpacity>
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
      {addresses.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <FlatList
            data={addresses}
            renderItem={renderAddress}
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
          
          <TouchableOpacity 
            style={[styles.floatingButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddAddress', { onAddressAdded: loadAddresses })}
          >
            <Text style={[styles.floatingButtonText, { color: colors.white }]}>+ Add New Address</Text>
          </TouchableOpacity>
        </>
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
    paddingBottom: 80,
  },
  addressCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
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
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    marginBottom: 4,
  },
  city: {
    fontSize: 14,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  defaultButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressListScreen;