import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserPoints } from '../services/pointsService';
import colors from '../utils/colors';

const PointsBadge = ({ onPress }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    if (user) {
      const result = await getUserPoints(user.uid);
      if (result.success) {
        setPoints(result.points);
      }
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <TouchableOpacity style={styles.badge} onPress={onPress} disabled={!onPress}>
      <Text style={styles.emoji}>⭐</Text>
      <Text style={styles.points}>{points}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  points: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default PointsBadge;