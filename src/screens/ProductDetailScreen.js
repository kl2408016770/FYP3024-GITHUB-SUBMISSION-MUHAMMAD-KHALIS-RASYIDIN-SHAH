import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getProductAverageRating } from '../services/reviewService';
import { ProductDetailSkeleton } from '../components/Skeleton';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { product } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRating();
  }, [product.id]);

  const loadRating = async () => {
    const result = await getProductAverageRating(product.id);
    if (result.success) {
      setRating({ average: result.average, count: result.count });
    }
    setLoading(false);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, specialInstructions);
    
    Alert.alert(
      '✓ Added to Cart',
      `${quantity}x ${product.name} added to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ 
            uri: product.imageUrl || product.image || 'https://via.placeholder.com/400/e1473d/ffffff?text=Product' 
          }}
          style={styles.image}
        />

        <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            RM {product.price?.toFixed(2)}
          </Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= rating.average ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: colors.textLight }]}>
              {rating.average > 0 ? rating.average.toFixed(1) : 'No'} 
              {' ('}{rating.count} {rating.count === 1 ? 'review' : 'reviews'})
            </Text>
          </View>

          <Text style={[styles.category, { color: colors.textLight }]}>
            Category: {product.category}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textLight }]}>
            {product.description}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
              onPress={decreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
            
            <TouchableOpacity 
              style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
              onPress={increaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Special Instructions (Optional)
          </Text>
          <TextInput
            style={[styles.instructionsInput, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="E.g., Less sugar, no nuts, etc."
            placeholderTextColor={colors.textLight}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { 
        backgroundColor: colors.background,
        borderTopColor: colors.border 
      }]}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddToCart}
        >
          <Text style={[styles.addButtonText, { color: colors.white }]}>
            Add to Cart • RM {(product.price * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  category: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  instructionsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;