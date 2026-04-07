import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { 
  getAllMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from '../../services/menuService';
import { Ionicons } from '@expo/vector-icons';
import CATEGORIES from '../../utils/categories';
import { CATEGORY_NAMES } from '../../utils/categories';

const AdminMenuScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  const categories = CATEGORY_NAMES;

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const result = await getAllMenuItems();
    if (result.success) {
      setMenuItems(result.items);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      description: '',
      price: '',
      category: categories[0],
      imageUrl: ''
    });
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || categories[0],
      imageUrl: item.imageUrl || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMenuItem(item.id);
            if (result.success) {
              loadMenuItems();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const itemData = {
      name: form.name,
      description: form.description,
      price: priceNum,
      category: form.category,
      image: form.imageUrl,  
      imageUrl: form.imageUrl || 'https://via.placeholder.com/400/e1473d/ffffff?text=Product'
    };

    let result;
    if (editingItem) {
      result = await updateMenuItem(editingItem.id, itemData);
    } else {
      result = await addMenuItem(itemData);
    }

    if (result.success) {
      setModalVisible(false);
      loadMenuItems();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderMenuItem = ({ item }) => (
    <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/100/e1473d/ffffff?text=Product' }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemCategory, { color: colors.textLight }]}>{item.category}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>RM {item.price.toFixed(2)}</Text>
        <Text style={[styles.itemDescription, { color: colors.textLight }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error + '20', marginTop: 8 }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAdd}
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={[styles.addButtonText, { color: colors.white }]}>Add New Item</Text>
      </TouchableOpacity>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: colors.textLight }]}>Name *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="e.g., Chocolate Cake"
                placeholderTextColor={colors.textLight}
              />

              <Text style={[styles.label, { color: colors.textLight }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                placeholder="Describe the product..."
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.label, { color: colors.textLight }]}>Price (RM) *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={form.price}
                onChangeText={(text) => setForm({ ...form, price: text })}
                placeholder="e.g., 25.90"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />

              <Text style={[styles.label, { color: colors.textLight }]}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { 
                        backgroundColor: form.category === cat ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setForm({ ...form, category: cat })}
                  >
                    <Text style={[
                      styles.categoryText,
                      { color: form.category === cat ? colors.white : colors.text }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textLight }]}>Image URL</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={form.imageUrl}
                onChangeText={(text) => setForm({ ...form, imageUrl: text })}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={colors.textLight}
              />
              <Text style={[styles.hint, { color: colors.textLight }]}>
                Upload image to ImgBB or ImageBam, then paste the direct link here
              </Text>

              {form.imageUrl ? (
                <View style={styles.previewContainer}>
                  <Text style={[styles.previewLabel, { color: colors.textLight }]}>Preview:</Text>
                  <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />
                </View>
              ) : null}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textLight }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.saveButtonText, { color: colors.white }]}>
                  {editingItem ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  list: {
    padding: 15,
  },
  menuCard: {
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
  },
  itemActions: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 15,
    maxHeight: 500,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 10,
  },
  previewContainer: {
    marginVertical: 15,
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminMenuScreen;