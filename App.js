
import 'text-encoding';
import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import MenuScreen from './src/screens/MenuScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import LoyaltyPointsScreen from './src/screens/LoyaltyPointsScreen';
import PointsBadge from './src/components/PointsBadge';
import SettingsScreen from './src/screens/SettingsScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddAddressScreen from './src/screens/AddAddressScreen';
import AddressListScreen from './src/screens/AddressListScreen';
import AddReviewScreen from './src/screens/AddReviewScreen';
import { useCart } from './src/context/CartContext';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminMenuScreen from './src/screens/admin/AdminMenuScreen';
import AdminOrdersScreen from './src/screens/admin/AdminOrdersScreen';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminReviewsScreen from './src/screens/admin/AdminReviewsScreen';
import AdminWaiterScreen from './src/screens/admin/AdminWaiterScreen';



SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator({ navigation, unreadCount, userData }) {
  const { colors } = useTheme();
  const { getItemCount } = useCart();
  console.log('User role in TabNavigator:', userData?.role);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          headerRight: () => (
            <PointsBadge onPress={() => navigation.navigate('LoyaltyPoints')} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: getItemCount() > 0 ? getItemCount() : null,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: { backgroundColor: colors.primary },
        }}
      />
      
      {/* Admin Tab - Use userData prop for role check */}
      {userData?.role?.trim() === 'admin' && (
        <Tab.Screen 
          name="Admin" 
          component={AdminDashboardScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}
function AppNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const { user, userData, loading } = useAuth();
  const { colors, loading: themeLoading } = useTheme();

  
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        if (user) {
          const saved = await AsyncStorage.getItem(`unread_count_${user.uid}`);
          if (saved !== null) {
            setUnreadCount(parseInt(saved));
          }
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      } finally {
        setLoadingCount(false);
      }
    };
    loadUnreadCount();
  }, [user]);

  
  useEffect(() => {
    const saveUnreadCount = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(`unread_count_${user.uid}`, unreadCount.toString());
        }
      } catch (error) {
        console.error('Error saving unread count:', error);
      }
    };
    saveUnreadCount();
  }, [unreadCount, user]);

  const handleNewOrders = (count) => {
    setUnreadCount(count);
  };

  if (loading || themeLoading || loadingCount) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
  name="MainTabs"
  children={(props) => <TabNavigator {...props} unreadCount={unreadCount} userData={userData} />}
  options={{ headerShown: false }}
/>
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                title: 'Product Details',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{
                title: 'Checkout',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="OrderHistory"
              children={(props) => (
                <OrderHistoryScreen
                  {...props}
                  onNewOrders={handleNewOrders}
                />
              )}
              options={{
                title: 'Order History',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{
                title: 'Order Details',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="LoyaltyPoints"
              component={LoyaltyPointsScreen}
              options={{
                title: 'Loyalty Points',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Settings',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen 
              name="AddressList" 
              component={AddressListScreen} 
              options={{ 
                title: 'My Addresses',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen 
              name="AddAddress" 
              component={AddAddressScreen} 
              options={{ 
                title: 'Add Address',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen 
              name="AddReview" 
              component={AddReviewScreen} 
              options={{ 
                title: 'Write a Review',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen 
  name="AdminMenu" 
  component={AdminMenuScreen} 
  options={{ 
    title: 'Manage Menu',
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.white,
  }}
/>

<Stack.Screen 
  name="AdminOrders" 
  component={AdminOrdersScreen} 
  options={{ 
    title: 'All Orders',
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.white,
  }}
/>
<Stack.Screen 
  name="AdminUsers" 
  component={AdminUsersScreen} 
  options={{ 
    title: 'Users',
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.white,
  }}
/>
<Stack.Screen 
  name="AdminReviews" 
  component={AdminReviewsScreen} 
  options={{ 
    title: 'Reviews',
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.white,
  }}
/>
<Stack.Screen 
  name="AdminWaiter" 
  component={AdminWaiterScreen} 
  options={{ 
    title: 'Waiter Requests',
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.white,
  }}
/>

          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
       
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});