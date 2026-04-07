import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useTheme } from '../context/ThemeContext';
import { MenuSkeleton } from '../components/Skeleton';
import { useRoute } from '@react-navigation/native';
import CATEGORIES from '../utils/categories';
import { CATEGORY_NAMES } from '../utils/categories';


const MenuScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const route = useRoute();
  const { selectedCategory } = route.params || {};
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [sortBy, setSortBy] = useState('name-asc');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load menu items
  const loadMenuItems = useCallback(async () => {
  // Set available categories from your central file
  setAvailableCategories(['All', ...CATEGORY_NAMES]);

  try {
    const querySnapshot = await getDocs(collection(db, 'menu'));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    setMenuItems(items);
    setFilteredItems(items);
    setSelectedCategories(['All']);
  } catch (error) {
    console.error('Error loading menu:', error);
    Alert.alert('Error', 'Failed to load menu items');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenuItems();
  }, [loadMenuItems]);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Apply filters whenever relevant state changes
  useEffect(() => {
    applyFilters();
  }, [menuItems, searchQuery, selectedCategories, priceRange, sortBy]);

  // Auto-apply category if passed from HomeScreen
  useEffect(() => {
    if (selectedCategory && availableCategories.includes(selectedCategory)) {
      setSelectedCategories([selectedCategory]);
      setShowFilters(false);
    }
  }, [selectedCategory, availableCategories]);

  const applyFilters = useCallback(() => {
    let result = [...menuItems];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    if (!selectedCategories.includes('All') && selectedCategories.length > 0) {
      result = result.filter(item => selectedCategories.includes(item.category));
    }

    result = result.filter(item =>
      item.price >= priceRange.min &&
      (priceRange.max === 0 || item.price <= priceRange.max)
    );

    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    setFilteredItems(result);
  }, [menuItems, searchQuery, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (category) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
      return;
    }

    let newCategories;
    if (selectedCategories.includes('All')) {
      newCategories = [category];
    } else {
      if (selectedCategories.includes(category)) {
        newCategories = selectedCategories.filter(c => c !== category);
        if (newCategories.length === 0) newCategories = ['All'];
      } else {
        newCategories = [...selectedCategories, category];
      }
    }
    setSelectedCategories(newCategories);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories(['All']);
    setPriceRange({ min: 0, max: 0 });
    setSortBy('name-asc');
    setShowFilters(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (!selectedCategories.includes('All')) count++;
    if (priceRange.min > 0 || priceRange.max > 0) count++;
    if (sortBy !== 'name-asc') count++;
    return count;
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{
          uri: item.imageUrl || item.image || 'https://via.placeholder.com/150/e1473d/ffffff?text=Product'
        }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemDescription, { color: colors.textLight }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>RM {item.price?.toFixed(2) || '0.00'}</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <Text style={[styles.addButtonText, { color: colors.white }]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // --- Filter Modal with local price state ---
  const FilterModal = () => {
    const [localMin, setLocalMin] = useState(priceRange.min.toString());
    const [localMax, setLocalMax] = useState(priceRange.max === 0 ? '' : priceRange.max.toString());

    // Reset local state when modal opens
    useEffect(() => {
      setLocalMin(priceRange.min === 0 ? '' : priceRange.min.toString());
      setLocalMax(priceRange.max === 0 ? '' : priceRange.max.toString());
    }, [showFilters]);

    const handleApply = () => {
      const newMin = localMin === '' ? 0 : parseInt(localMin, 10);
      const newMax = localMax === '' ? 0 : parseInt(localMax, 10);
      setPriceRange({ min: isNaN(newMin) ? 0 : newMin, max: isNaN(newMax) ? 0 : newMax });
      setShowFilters(false);
    };

    const handleClear = () => {
      setLocalMin('');
      setLocalMax('');
      setPriceRange({ min: 0, max: 0 });
      setShowFilters(false);
    };

    return (
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={[styles.closeButton, { color: colors.textLight }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort Options */}
              <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort By</Text>
                <View style={styles.sortOptions}>
                  {[
                    { value: 'name-asc', label: 'Name (A-Z)' },
                    { value: 'name-desc', label: 'Name (Z-A)' },
                    { value: 'price-asc', label: 'Price (Low to High)' },
                    { value: 'price-desc', label: 'Price (High to Low)' },
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border
                        },
                        sortBy === option.value && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary
                        }
                      ]}
                      onPress={() => setSortBy(option.value)}
                    >
                      <Text style={[
                        styles.sortOptionText,
                        { color: colors.text },
                        sortBy === option.value && { color: colors.white }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Categories */}
              <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Categories</Text>
                <View style={styles.categoryOptions}>
                  {availableCategories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border
                        },
                        selectedCategories.includes(category) && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary
                        }
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        { color: colors.text },
                        selectedCategories.includes(category) && { color: colors.white }
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Price Range (RM)</Text>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInput}>
                    <Text style={[styles.priceLabel, { color: colors.textLight }]}>Minimum</Text>
                    <TextInput
                      style={[styles.priceTextInput, {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }]}
                      value={localMin}
                      onChangeText={(text) => setLocalMin(text.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  <View style={styles.priceInput}>
                    <Text style={[styles.priceLabel, { color: colors.textLight }]}>Maximum</Text>
                    <TextInput
                      style={[styles.priceTextInput, {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }]}
                      value={localMax}
                      onChangeText={(text) => setLocalMax(text.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      placeholder="No max"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: colors.primary }]}
                onPress={handleClear}
              >
                <Text style={[styles.clearButtonText, { color: colors.primary }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={handleApply}
              >
                <Text style={[styles.applyButtonText, { color: colors.white }]}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading && !refreshing) {
    return <MenuSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, {
        backgroundColor: colors.card,
        borderBottomColor: colors.border
      }]}>
        <View style={[styles.searchBox, {
          backgroundColor: colors.background,
          borderColor: colors.border
        }]}>
          <Text style={[styles.searchIcon, { color: colors.textLight }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search cakes, pastries..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearIcon, { color: colors.textLight }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border
            },
            getActiveFilterCount() > 0 && {
              backgroundColor: colors.primary + '20',
              borderColor: colors.primary
            }
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {getActiveFilterCount() > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.filterBadgeText, { color: colors.white }]}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View style={[styles.resultsInfo, {
        backgroundColor: colors.card,
        borderBottomColor: colors.border
      }]}>
        <Text style={[styles.resultsText, { color: colors.textLight }]}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
        </Text>
        {getActiveFilterCount() > 0 && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyEmoji, { color: colors.textLight }]}>😕</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No items found</Text>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>Try adjusting your search or filters</Text>
          <TouchableOpacity
            style={[styles.clearAllButton, { backgroundColor: colors.primary }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearAllButtonText, { color: colors.white }]}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.menuList}
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

      <FilterModal />
    </View>
  );
};

// Styles remain unchanged – keep your existing styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 16,
    padding: 5,
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  resultsText: {
    fontSize: 14,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuList: {
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: 12,
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
  clearAllButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 14,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 15,
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  priceTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MenuScreen;