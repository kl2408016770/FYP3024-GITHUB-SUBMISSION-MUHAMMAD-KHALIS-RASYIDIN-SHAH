import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { saveReview, hasUserReviewed } from '../services/reviewService';
import { useTheme } from '../context/ThemeContext';

const AddReviewScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { order, product } = route.params;
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const checkIfReviewed = useCallback(async () => {
    const result = await hasUserReviewed(user.uid, product.id, order.id);
    if (result.success) {
      setAlreadyReviewed(result.reviewed);
      if (result.reviewed) {
        Alert.alert(
          'Already Reviewed',
          'You have already reviewed this product from this order',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }
    setChecking(false);
  }, [user.uid, product.id, order.id, navigation]);

  useEffect(() => {
    checkIfReviewed();
  }, [checkIfReviewed]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setLoading(true);
    
    const result = await saveReview(
      user.uid,
      product.id,
      order.id,
      rating,
      comment.trim() || 'No comment'
    );

    setLoading(false);

    if (result.success) {
      Alert.alert(
        '✓ Thank You!',
        'Your review has been submitted',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderStar = (star) => (
    <TouchableOpacity
      key={star}
      onPress={() => setRating(star)}
      style={styles.starButton}
    >
      <Text style={[styles.star, star <= rating ? styles.starFilled : { color: colors.textLight }]}>
        ★
      </Text>
    </TouchableOpacity>
  );

  if (checking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (alreadyReviewed) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.productCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
        <Text style={[styles.orderNumber, { color: colors.textLight }]}>Order: {order.orderNumber}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Rate this product</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(renderStar)}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Your review (optional)</Text>
        <TextInput
          style={[styles.commentInput, { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text
          }]}
          placeholder="Tell us what you thought about this product..."
          placeholderTextColor={colors.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.submitButtonText, { color: colors.white }]}>Submit Review</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCard: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderNumber: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  starButton: {
    paddingHorizontal: 8,
  },
  star: {
    fontSize: 40,
  },
  starFilled: {
    color: '#FFD700',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    margin: 15,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 20,
  },
});

export default AddReviewScreen;