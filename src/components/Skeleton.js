import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export const Skeleton = ({ style }) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { backgroundColor: colors.textLight, opacity },
        style,
      ]}
    />
  );
};

export const MenuSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchSkeleton}>
        <Skeleton style={styles.searchBar} />
        <Skeleton style={styles.filterButton} />
      </View>
      <View style={styles.categoriesSkeleton}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} style={styles.categoryChip} />
        ))}
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.productCardSkeleton}>
          <Skeleton style={styles.productImage} />
          <View style={styles.productInfoSkeleton}>
            <Skeleton style={styles.productName} />
            <Skeleton style={styles.productDesc} />
            <Skeleton style={styles.productPrice} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const ProductDetailSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Skeleton style={styles.detailImage} />
      <View style={styles.detailContent}>
        <Skeleton style={styles.detailTitle} />
        <Skeleton style={styles.detailPrice} />
        <Skeleton style={styles.detailCategory} />
        <Skeleton style={styles.divider} />
        <Skeleton style={styles.detailSection} />
        <Skeleton style={styles.detailText} />
        <Skeleton style={styles.detailText} />
        <Skeleton style={styles.detailText} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  searchSkeleton: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  categoriesSkeleton: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryChip: {
    width: 80,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  productCardSkeleton: {
    flexDirection: 'row',
    marginBottom: 15,
    height: 120,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  productInfoSkeleton: {
    flex: 1,
    justifyContent: 'space-around',
  },
  productName: {
    height: 20,
    width: '70%',
    borderRadius: 4,
  },
  productDesc: {
    height: 16,
    width: '90%',
    borderRadius: 4,
  },
  productPrice: {
    height: 18,
    width: '40%',
    borderRadius: 4,
  },
  detailImage: {
    width: '100%',
    height: 300,
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    height: 28,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  detailPrice: {
    height: 24,
    width: '30%',
    borderRadius: 4,
    marginBottom: 8,
  },
  detailCategory: {
    height: 18,
    width: '40%',
    borderRadius: 4,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  detailSection: {
    height: 22,
    width: '40%',
    borderRadius: 4,
    marginBottom: 12,
  },
  detailText: {
    height: 18,
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
});