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
import { useTheme } from '../../context/ThemeContext';
import { getAllReviews, deleteReview } from '../../services/reviewService';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AdminReviewsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    const result = await getAllReviews();
    if (result.success) {
      setReviews(result.reviews);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReviews();
  }, [loadReviews]);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews])
  );

  const handleDelete = (review) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteReview(review.id);
            if (result.success) {
              loadReviews();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const renderReview = ({ item }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {item.userId?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={[styles.userId, { color: colors.text }]}>User: {item.userId?.slice(-6)}</Text>
            <Text style={[styles.date, { color: colors.textLight }]}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.productName, { color: colors.text }]}>Product: {item.productId?.slice(-6)}</Text>
      <Text style={[styles.rating, { color: '#FFD700' }]}>{renderStars(item.rating)}</Text>
      <Text style={[styles.comment, { color: colors.textLight }]}>{item.comment}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyEmoji, { color: colors.textLight }]}>⭐</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No reviews yet</Text>
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
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
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
        ListEmptyComponent={renderEmpty}
      />
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
  },
  reviewCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userId: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  rating: {
    fontSize: 16,
    marginBottom: 8,
    letterSpacing: 2,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default AdminReviewsScreen;