import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getAllMenuItems } from '../../services/menuService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AdminDashboardScreen = ({ navigation: propNavigation }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalReviews: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get products count
      const menuResult = await getAllMenuItems();
      const productsCount = menuResult.success ? menuResult.items.length : 0;

      // Get orders count
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const ordersCount = ordersSnap.size;

      // Get users count
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersCount = usersSnap.size;

      // Get reviews count
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      const reviewsCount = reviewsSnap.size;

      setStats({
        totalProducts: productsCount,
        totalOrders: ordersCount,
        totalUsers: usersCount,
        totalReviews: reviewsCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textLight }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const MenuButton = ({ title, icon, onPress, color }) => (
    <TouchableOpacity 
      style={[styles.menuButton, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Admin Dashboard</Text>
        <Text style={[styles.dateText, { color: colors.textLight }]}>
          {new Date().toLocaleDateString('en-MY', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          title="Products"
          value={stats.totalProducts}
          icon="restaurant"
          color="#e1473d"
          onPress={() => navigation.navigate('AdminMenu')}
        />
        <StatCard 
          title="Orders"
          value={stats.totalOrders}
          icon="cart"
          color="#4CAF50"
          onPress={() => navigation.navigate('AdminOrders')}
        />
        <StatCard 
          title="Users"
          value={stats.totalUsers}
          icon="people"
          color="#2196F3"
          onPress={() => navigation.navigate('AdminUsers')}
        />
        <StatCard 
          title="Reviews"
          value={stats.totalReviews}
          icon="star"
          color="#FFC107"
          onPress={() => navigation.navigate('AdminReviews')}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        
        <MenuButton 
          title="Manage Menu"
          icon="restaurant"
          color="#e1473d"
          onPress={() => navigation.navigate('AdminMenu')}
        />
        
        <MenuButton 
          title="View Orders"
          icon="cart"
          color="#4CAF50"
          onPress={() => navigation.navigate('AdminOrders')}
        />
        
        <MenuButton 
          title="Manage Users"
          icon="people"
          color="#2196F3"
          onPress={() => navigation.navigate('AdminUsers')}
        />
        
        <MenuButton 
          title="Moderate Reviews"
          icon="star"
          color="#FFC107"
          onPress={() => navigation.navigate('AdminReviews')}
        />
        
        <MenuButton 
          title="Waiter Requests"
          icon="cafe"
          color="#9C27B0"
          onPress={() => navigation.navigate('AdminWaiter')}
        />

        {/* Admin Manual */}
        <MenuButton 
  title="Admin Manual"
  icon="book"
  color="#9C27B0"
  onPress={() => WebBrowser.openBrowserAsync('https://drive.google.com/file/d/1Kd1arYYcAxIaNqfmRl1M_ji8bL9MCBkJ/view?usp=sharing')}
/>
      </View>
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
  header: {
    padding: 20,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '45%',
    margin: '2.5%',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;