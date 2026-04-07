import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { saveAddress } from '../services/addressService';
import { useTheme } from '../context/ThemeContext';

const AddAddressScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { onAddressAdded } = route.params || {};
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.postalCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    const result = await saveAddress(user.uid, form);
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Address saved successfully');
      if (onAddressAdded) onAddressAdded();
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textLight }]}>Recipient Name</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="e.g., John Doe"
            placeholderTextColor={colors.textLight}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textLight }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="e.g., 0123456789"
            placeholderTextColor={colors.textLight}
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textLight }]}>Street Address</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="e.g., 123 Jalan Example, Taman Example"
            placeholderTextColor={colors.textLight}
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textLight }]}>City</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="e.g., Kuala Lumpur"
            placeholderTextColor={colors.textLight}
            value={form.city}
            onChangeText={(text) => setForm({ ...form, city: text })}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: colors.textLight }]}>State</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="e.g., Selangor"
              placeholderTextColor={colors.textLight}
              value={form.state}
              onChangeText={(text) => setForm({ ...form, state: text })}
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.textLight }]}>Postal Code</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="e.g., 50000"
              placeholderTextColor={colors.textLight}
              value={form.postalCode}
              onChangeText={(text) => setForm({ ...form, postalCode: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.switchContainer, { 
          backgroundColor: colors.card,
          borderColor: colors.border 
        }]}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Set as default address</Text>
          <Switch
            value={form.isDefault}
            onValueChange={(value) => setForm({ ...form, isDefault: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.white }]}>Save Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddAddressScreen;