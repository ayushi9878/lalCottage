import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Mail, Phone, User, MapPin, CreditCard, History, Settings, Save, AlertCircle, CheckCircle, LogOut, Key } from 'lucide-react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    photoURL: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: true,
      marketing: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debug, setDebug] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const navigate = useNavigate();

  // Check for changes when profileData or preferences change
  useEffect(() => {
    const dataChanged = JSON.stringify(profileData) !== JSON.stringify(originalData);
    setHasChanges(dataChanged);
  }, [profileData, originalData]);

  useEffect(() => {
    setDebug('Profile component mounted, setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setDebug('Auth state changed');
      
      try {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          setDebug('No authenticated user found, redirecting to login');
          navigate('/login');
          return;
        }

        setUser(firebaseUser);
        setDebug(`Authenticated user found: ${firebaseUser.email || firebaseUser.uid}`);
        
        // Fetch user profile from Firestore
        await fetchUserProfile(firebaseUser.uid);
        
        // Fetch booking history
        await fetchBookingHistory(firebaseUser.uid);
        
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(`Authentication error: ${err.message}`);
        setDebug(`Auth error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (uid) => {
    try {
      setDebug('Fetching user profile from Firestore...');
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDebug('User profile data found in Firestore');
        
        const profile = {
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          dateOfBirth: userData.dateOfBirth || '',
          photoURL: userData.photoURL || ''
        };

        setProfileData(profile);
        setOriginalData(profile); // Store original data for comparison
        
        // Set preferences if they exist
        if (userData.preferences) {
          setPreferences(userData.preferences);
        }

        setDebug(`Profile loaded successfully for user: ${userData.fullName || userData.email}`);
        
      } else {
        setDebug('No user document found in Firestore, creating basic profile...');
        
        // Create basic profile from Firebase Auth data
        const basicProfile = {
          fullName: user?.displayName || '',
          email: user?.email || '',
          phone: user?.phoneNumber || '',
          address: '',
          dateOfBirth: '',
          photoURL: user?.photoURL || ''
        };

        setProfileData(basicProfile);
        setOriginalData(basicProfile);
        
        // Optionally create the document in Firestore
        setError('Profile not found in database. Please update your information.');
      }
      
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setDebug(`Firestore fetch error: ${err.message}`);
      
      // Fallback to Firebase Auth data
      if (user) {
        const fallbackProfile = {
          fullName: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          address: '',
          dateOfBirth: '',
          photoURL: user.photoURL || ''
        };
        
        setProfileData(fallbackProfile);
        setOriginalData(fallbackProfile);
        setError('Could not load profile from database. Showing basic information.');
      }
    }
  };

  const fetchBookingHistory = async (uid) => {
    try {
      setDebug('Fetching booking history...');
      
      // Query bookings collection for this user
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef, 
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookings = [];
      
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setBookingHistory(bookings);
      setDebug(`Found ${bookings.length} bookings for user`);
      
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setDebug(`Booking fetch error: ${err.message}`);
      // Don't set this as a critical error, just log it
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('No user found. Please sign in again.');
      return;
    }

    if (!hasChanges) {
      setError('No changes to save.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    setDebug('Updating profile...');

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Prepare update data
      const updateData = {
        ...profileData,
        updatedAt: new Date(),
        profileComplete: !!(profileData.fullName && profileData.email && profileData.phone)
      };

      // Update document in Firestore
      await updateDoc(userDocRef, updateData);
      
      // Update original data to reflect saved state
      setOriginalData({ ...profileData });
      setSuccess('Profile updated successfully!');
      setDebug('Profile update completed');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message}`);
      setDebug(`Update error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (newPreferences) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        preferences: newPreferences,
        updatedAt: new Date()
      });
      
      setPreferences(newPreferences);
      setSuccess('Preferences updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(`Failed to update preferences: ${err.message}`);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setPasswordError('No user found. Please sign in again.');
      return;
    }

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close dialog after success
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPasswordSuccess('');
      }, 2000);
      
    } catch (err) {
      console.error('Error changing password:', err);
      
      // Handle specific error cases
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('New password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/requires-recent-login') {
        setPasswordError('For security reasons, please sign out and sign back in before changing your password.');
      } else {
        setPasswordError(`Failed to change password: ${err.message}`);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-lg mb-4">Loading your profile...</div>
        {debug && <div className="text-xs text-blue-600 max-w-md text-center">Debug: {debug}</div>}
        {error && <div className="text-xs text-red-600 max-w-md text-center">Error: {error}</div>}
      </div>
    );
  }

  // Show error if auth failed
  if (error && error.startsWith('Authentication error')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-600 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          {error}
        </div>
        {debug && <div className="text-xs text-blue-600 mt-4 max-w-md text-center">Debug: {debug}</div>}
        <Button className="mt-4" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
            <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && !error.startsWith('Authentication error') && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-2xl">
                    {profileData.fullName ? profileData.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{profileData.fullName || 'No Name'}</CardTitle>
                <CardDescription>{profileData.email || 'No Email'}</CardDescription>
                <Badge variant="secondary" className="mt-2">Guest</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profileData.phone || 'No Phone'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profileData.address || 'No Address'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={profileData.address}
                            onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={saving || !hasChanges}
                        className="flex items-center gap-2"
                      >
                        {saving ? 'Saving...' : 'Update Profile'}
                        <Save className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>
                      View your past and upcoming bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookingHistory.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No bookings found.</div>
                      ) : (
                        bookingHistory.map((booking) => (
                          <div key={booking.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold">Royal Haveli Booking</h3>
                                <p className="text-sm text-muted-foreground">
                                  Booked on {new Date(booking.date).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Check-in</p>
                                <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Check-out</p>
                                <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Guests</p>
                                <p className="font-medium">
                                  {booking.guests.adults + booking.guests.children} guests
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total</p>
                                <p className="font-medium">₹{booking.amount.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notifications</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={preferences.notifications.email}
                            onChange={(e) => handlePreferencesUpdate({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                email: e.target.checked
                              }
                            })}
                            className="rounded" 
                          />
                          <span>Email notifications for booking confirmations</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={preferences.notifications.sms}
                            onChange={(e) => handlePreferencesUpdate({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                sms: e.target.checked
                              }
                            })}
                            className="rounded" 
                          />
                          <span>SMS notifications for important updates</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={preferences.notifications.marketing}
                            onChange={(e) => handlePreferencesUpdate({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                marketing: e.target.checked
                              }
                            })}
                            className="rounded" 
                          />
                          <span>Marketing emails and offers</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Security</h3>
                      <div className="space-y-2">
                        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              Change Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change Password</DialogTitle>
                              <DialogDescription>
                                Enter your current password and choose a new one.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                              {passwordError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                                  {passwordError}
                                </div>
                              )}
                              
                              {passwordSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                                  {passwordSuccess}
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                  id="currentPassword"
                                  type="password"
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                  required
                                  minLength={6}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                  required
                                  minLength={6}
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setShowPasswordDialog(false)}
                                  disabled={passwordLoading}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={passwordLoading}
                                  className="flex items-center gap-2"
                                >
                                  {passwordLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline">Two-Factor Authentication</Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account Actions</h3>
                      <div className="space-x-2">
                        <Button variant="outline">Export Data</Button>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;