import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  const validatePassword = (pass) => {
    setPasswordChecks({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
    });
    setPassword(pass);
  };

  const isPasswordValid = () => {
    return passwordChecks.length && passwordChecks.uppercase && 
           passwordChecks.number && passwordChecks.special;
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin) {
      if (!name) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
      if (!isPasswordValid()) {
        Alert.alert('Error', 'Password does not meet requirements');
        return;
      }
    }

    setLoading(true);
    
    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(email, password, name, phone);
    }

    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const PasswordRequirement = ({ label, met }) => (
    <View style={styles.requirementRow}>
      <Text style={[styles.requirementIcon, { color: met ? colors.success : colors.textLight }]}>
        {met ? '✓' : '○'}
      </Text>
      <Text style={[styles.requirementText, { color: met ? colors.success : colors.textLight }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Chi & Co Connect</Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textLight}
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
                
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  placeholder="Phone Number (optional)"
                  placeholderTextColor={colors.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </>
            )}
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="Email"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={validatePassword}
              secureTextEntry
              editable={!loading}
            />

            {!isLogin && (
              <View style={styles.passwordRequirements}>
                <PasswordRequirement label="At least 8 characters" met={passwordChecks.length} />
                <PasswordRequirement label="At least 1 uppercase letter" met={passwordChecks.uppercase} />
                <PasswordRequirement label="At least 1 number" met={passwordChecks.number} />
                <PasswordRequirement label="At least 1 special character" met={passwordChecks.special} />
              </View>
            )}

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  {isLogin ? 'Login' : 'Register'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
              <Text style={[styles.switchText, { color: colors.primary }]}>
                {isLogin 
                  ? "Don't have an account? Register" 
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
  style={styles.manualButton}
  onPress={() => WebBrowser.openBrowserAsync('https://drive.google.com/file/d/1gSE7_32tF_nIhfpqOCAC7aiuUIDtbPDU/view?usp=sharing')}
>
  <Text style={[styles.manualText, { color: colors.primary }]}>📖 User Manual</Text>
</TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordRequirements: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  requirementText: {
    fontSize: 14,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  manualButton: {
  marginTop: 20,
  alignSelf: 'center',
},
manualText: {
  fontSize: 14,
  fontWeight: '500',
},
});

export default LoginScreen;