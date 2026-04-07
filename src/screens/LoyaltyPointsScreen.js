import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserPoints, deductPoints } from '../services/pointsService';
import { useFocusEffect } from '@react-navigation/native';

const REWARDS = [
  {
    id: 1,
    name: 'RM 5 Discount',
    points: 100,
    description: 'Get RM 5 off your next order',
    discount: 5
  },
  {
    id: 2,
    name: 'RM 10 Discount',
    points: 180,
    description: 'Get RM 10 off your next order',
    discount: 10
  },
  {
    id: 3,
    name: 'Free Drink',
    points: 50,
    description: 'Any regular-sized drink free',
    discount: 'free drink'
  },
  {
    id: 4,
    name: 'Free Slice of Cake',
    points: 80,
    description: 'Any single slice of cake free',
    discount: 'free cake'
  },
];

const LoyaltyPointsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const loadPoints = useCallback(async () => {
    const result = await getUserPoints(user.uid);
    if (result.success) {
      setPoints(result.points);
    }
    setLoading(false);
  }, [user.uid]);

  useFocusEffect(
    useCallback(() => {
      loadPoints();
    }, [loadPoints])
  );

  const handleRedeem = async (reward) => {
    if (points < reward.points) {
      Alert.alert('Insufficient Points', `You need ${reward.points - points} more points for this reward.`);
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem ${reward.name} for ${reward.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setRedeeming(true);
            const result = await deductPoints(user.uid, reward.points);
            setRedeeming(false);
            
            if (result.success) {
              setPoints(prev => prev - reward.points);
              Alert.alert(
                '🎉 Success!',
                `You've redeemed ${reward.name}. Show this screen at checkout.`
              );
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.pointsEmoji}>⭐</Text>
        <Text style={[styles.pointsTitle, { color: colors.white }]}>Your Points</Text>
        <Text style={[styles.pointsValue, { color: colors.white }]}>{points}</Text>
        <Text style={[styles.pointsSubtitle, { color: colors.white }]}>Earn 1 point for every RM1 spent</Text>
      </View>

      <View style={[styles.progressSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Reward</Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${Math.min((points % 100) / 100 * 100, 100)}%` 
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {100 - (points % 100)} more points for next RM5 discount
        </Text>
      </View>

      <View style={styles.rewardsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Rewards</Text>
        {REWARDS.map(reward => (
          <TouchableOpacity
            key={reward.id}
            style={[
              styles.rewardCard,
              { backgroundColor: colors.card },
              points < reward.points && { opacity: 0.5 }
            ]}
            onPress={() => handleRedeem(reward)}
            disabled={redeeming || points < reward.points}
          >
            <View style={styles.rewardInfo}>
              <Text style={[styles.rewardName, { color: colors.text }]}>{reward.name}</Text>
              <Text style={[styles.rewardDescription, { color: colors.textLight }]}>{reward.description}</Text>
            </View>
            <View style={[
              styles.pointsBadge,
              { backgroundColor: colors.primary + '20' },
              points >= reward.points && { backgroundColor: colors.primary }
            ]}>
              <Text style={[
                styles.pointsBadgeText,
                { color: colors.primary },
                points >= reward.points && { color: colors.white }
              ]}>
                {reward.points} ⭐
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>How it works</Text>
        <Text style={[styles.infoText, { color: colors.textLight }]}>• Earn 1 point for every RM1 spent</Text>
        <Text style={[styles.infoText, { color: colors.textLight }]}>• Points are automatically added after order</Text>
        <Text style={[styles.infoText, { color: colors.textLight }]}>• Redeem points for discounts and free items</Text>
        <Text style={[styles.infoText, { color: colors.textLight }]}>• Points never expire</Text>
      </View>

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
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  pointsEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  pointsTitle: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 5,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pointsSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  progressSection: {
    marginHorizontal: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  rewardsSection: {
    padding: 15,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    height: 30,
  },
});

export default LoyaltyPointsScreen;