import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getUserPoints } from '../services/pointsService';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useFocusEffect } from '@react-navigation/native';
import CATEGORIES from '../utils/categories';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, userData } = useAuth();
  const { getItemCount } = useCart();
  const [points, setPoints] = useState(0);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (user) {
      const pointsResult = await getUserPoints(user.uid);
      if (pointsResult.success) {
        setPoints(pointsResult.points);
      }
    }

    try {
      const q = query(collection(db, 'menu'), limit(4));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setFeaturedItems(items);
    } catch (error) {
      console.error('Error loading featured items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.featuredCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ 
          uri: item.imageUrl || item.image || 'https://via.placeholder.com/150/e1473d/ffffff?text=Cake' 
        }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredInfo}>
        <Text style={[styles.featuredName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.featuredPrice, { color: colors.primary }]}>RM {item.price?.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const displayName = userData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Guest';

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
        <Text style={[styles.welcomeText, { color: colors.white }]}>Welcome back,</Text>
        <Text style={[styles.userName, { color: colors.white }]}>{displayName}</Text>
        <Text style={[styles.tagline, { color: colors.white }]}>Delicious food made accessible</Text>
        
        <TouchableOpacity 
          style={[styles.orderButton, { backgroundColor: colors.white }]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={[styles.orderButtonText, { color: colors.primary }]}>Order Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{getItemCount()}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Cart</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{points}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Points</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={[styles.statNumber, { color: colors.primary }]}>View</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Orders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[styles.categoryCard, { backgroundColor: category.color + '30' }]}
              onPress={() => navigation.navigate('Menu', { selectedCategory: category.name })}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Items</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredItems}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      </View>

      <TouchableOpacity 
        style={[styles.pointsPromo, { 
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary + '40'
        }]}
        onPress={() => navigation.navigate('LoyaltyPoints')}
      >
        <View style={styles.promoContent}>
          <Text style={styles.promoEmoji}>⭐</Text>
          <View style={styles.promoText}>
            <Text style={[styles.promoTitle, { color: colors.text }]}>Loyalty Points</Text>
            <Text style={[styles.promoSubtitle, { color: colors.textLight }]}>
              You have {points} points — redeem for free items!
            </Text>
          </View>
          <Text style={[styles.promoArrow, { color: colors.primary }]}>→</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
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
  heroBanner: {
    padding: 30,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  orderButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -25,
    marginHorizontal: 20,
  },
  statCard: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    width: 100,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredList: {
    paddingRight: 20,
  },
  featuredCard: {
    width: 150,
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  featuredInfo: {
    padding: 10,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointsPromo: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 12,
  },
  promoArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 30,
  },
});

export default HomeScreen;