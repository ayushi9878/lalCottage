import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    setDebugInfo('Form submission started...');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setDebugInfo('Error: Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      setDebugInfo('Error: Password too short');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setDebugInfo('Error: Full name is required');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setDebugInfo('Error: Phone number is required');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo('Creating user account...');

    try {
      // Check if Firebase auth is properly initialized
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      console.log('Creating user with Firebase...');
      setDebugInfo('Calling Firebase createUserWithEmailAndPassword...');

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      console.log('User created successfully:', user);
      setDebugInfo('User created, updating profile...');

      // Update the user's display name
      await updateProfile(user, {
        displayName: formData.fullName
      });

      setDebugInfo('Profile updated, saving to Firestore...');

      // Check if Firestore is properly initialized
      if (!db) {
        throw new Error('Firebase Firestore not initialized');
      }

      // Create comprehensive user document in Firestore
      const userData = {
        uid: user.uid,
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        authProvider: 'email',
        createdAt: new Date(),
        updatedAt: new Date(),
        profileComplete: true,
        // Additional fields that can be updated later
        address: '',
        dateOfBirth: null,
        preferences: {
          notifications: {
            email: true,
            sms: true,
            marketing: false
          }
        },
        // Account status
        isActive: true,
        emailVerified: user.emailVerified || false
      };

      // Save user data to Firestore with error handling
      await setDoc(doc(db, 'users', user.uid), userData, { merge: false });

      console.log('User data saved to Firestore:', userData);
      setDebugInfo('Data saved to Firestore successfully!');

      // Small delay to ensure data is written
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Navigating to profile page...');
      setDebugInfo('Navigating to profile...');
      
      // Navigate to profile page to see the saved data
      navigate('/profile');

    } catch (error) {
      console.error('Error creating user:', error);
      
      // More detailed error handling
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code) {
        errorMessage = getErrorMessage(error.code);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setDebugInfo(`Error: ${error.message} (Code: ${error.code || 'Unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    setDebugInfo('Starting Google sign up...');

    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase not properly initialized');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setDebugInfo('Google sign up successful, checking existing user...');

      // Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User already exists, sign them out and show error
        await auth.signOut();
        setError('An account with this Google account already exists. Please sign in instead.');
        setDebugInfo('User already exists, signed out');
        return;
      }

      setDebugInfo('Creating new Google user document...');

      // Create comprehensive user document for Google sign-up
      const userData = {
        uid: user.uid,
        fullName: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        authProvider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
        profileComplete: !!(user.displayName && user.email),
        // Additional fields
        address: '',
        dateOfBirth: null,
        preferences: {
          notifications: {
            email: true,
            sms: true,
            marketing: false
          }
        },
        isActive: true,
        emailVerified: user.emailVerified || false,
        photoURL: user.photoURL || null
      };

      // Save user data to Firestore
      await setDoc(userDocRef, userData, { merge: false });

      console.log('Google user signed up:', userData);
      setDebugInfo('Google user data saved successfully!');
      
      // Small delay to ensure data is written
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to profile page
      navigate('/profile');

    } catch (error) {
      console.error('Error with Google sign-up:', error);
      setDebugInfo(`Google sign up error: ${error.message}`);
      
      // Handle specific Google auth errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email using a different sign-in method. Please use email/password to sign in.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-up was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups and try again.');
      } else {
        setError(getErrorMessage(error.code) || 'Failed to sign up with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'This email address is already registered. Please sign in instead.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/popup-closed-by-user': 'Sign-up was cancelled. Please try again.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'permission-denied': 'Permission denied. Please check your Firestore security rules.',
      'unavailable': 'Service temporarily unavailable. Please try again later.'
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to book your royal experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Debug Info Display */}
          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-600">{debugInfo}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 characters)"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Creating Account...' : 'Sign up with Google'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;