import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, Mail, Phone, MessageCircle, CreditCard, IndianRupee, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MenuSelection from '@/components/MenuSelection';

const BookingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ref: formRef, isVisible } = useScrollAnimation(0.1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    infants: '0',
    specialRequests: '',
  });

  const [selectedMenuItems, setSelectedMenuItems] = useState<{ [key: string]: number }>({});
  const [menuTotal, setMenuTotal] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Pre-fill form with user data if available
        setFormData(prev => ({
          ...prev,
          email: user.email || prev.email,
          firstName: user.displayName?.split(' ')[0] || prev.firstName,
          lastName: user.displayName?.split(' ').slice(1).join(' ') || prev.lastName,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Basic validation
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'checkIn', 'checkOut'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!currentUser) {
        toast({
          title: "Not Logged In",
          description: "Please log in to submit a booking.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Date validation
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights <= 0) {
        toast({
          title: "Invalid Dates",
          description: "Check-out date must be after check-in date.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare booking data
      const bookingData = {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        selectedItems: Object.entries(selectedMenuItems)
          .filter(([_, quantity]) => quantity > 0)
          .map(([itemId, quantity]) => ({
            id: itemId,
            quantity: Number(quantity)
          })),
        menuTotal: Number(menuTotal),
        roomPrice: Number(roomPrice),
        numberOfNights: nights,
        roomSubtotal: nights * roomPrice,
        totalAmount: calculateTotal(),
        bookingId: `BK${Date.now().toString().slice(-8)}`,
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
      };

      // Save booking to Firebase (as draft/pending)
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        status: 'draft',
        paymentStatus: 'pending'
      });

      toast({
        title: "Booking Details Saved!",
        description: `Proceeding to payment. Booking ID: ${bookingData.bookingId}`,
        variant: "default",
      });

      // Navigate to payment page with booking data
      navigate('/payment', { 
        state: { 
          ...bookingData, 
          firestoreId: docRef.id 
        } 
      });
      
    } catch (error) {
      console.error('Booking submission error:', error);
      
      toast({
        title: "Submission Failed",
        description: "There was an error saving your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomPrice = 2400;

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut) return menuTotal;
    
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return menuTotal;
    
    return (nights * roomPrice) + menuTotal;
  };

  const handleMenuItemChange = (itemId: string, quantity: number) => {
    setSelectedMenuItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const handleMenuTotalChange = (total: number) => {
    setMenuTotal(total);
  };

  return (
    <section id="booking" className="py-12 sm:py-20 bg-muted/30" ref={formRef}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="font-royal text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Book Your Stay
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete the form below to reserve your royal Rajasthani experience
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Form */}
            <div className={`lg:col-span-2 space-y-6 transition-all duration-500 delay-150 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              {/* Authentication Status */}
              {!currentUser && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-amber-800">
                      <MessageCircle className="w-5 h-5" />
                      <p className="text-sm">
                        Please <button type="button" onClick={() => navigate('/login')} className="underline font-medium">log in</button> to submit your booking.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Personal Information */}
              <Card className="shadow-sm border-primary/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 font-royal text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Guest Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        required
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        required
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          className="pl-10"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="pl-10"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stay Details */}
              <Card className="shadow-sm border-primary/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 font-royal text-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Stay Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Check-in / Check-out Section */}
                  <div className="bg-muted/50 rounded-xl p-4 sm:p-6 border border-primary/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Check-in */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Check in</Label>
                        <div className="bg-background rounded-lg p-3 border border-border hover:border-primary/20 transition-colors">
                          <Input
                            type="date"
                            value={formData.checkIn}
                            onChange={(e) => handleInputChange('checkIn', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            disabled={isSubmitting}
                            className="border-0 p-0 text-base font-medium bg-transparent focus-visible:ring-0"
                          />
                        </div>
                      </div>
                      
                      {/* Check-out */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Check out</Label>
                        <div className="bg-background rounded-lg p-3 border border-border hover:border-primary/20 transition-colors">
                          <Input
                            type="date"
                            value={formData.checkOut}
                            onChange={(e) => handleInputChange('checkOut', e.target.value)}
                            min={formData.checkIn || new Date().toISOString().split('T')[0]}
                            required
                            disabled={isSubmitting}
                            className="border-0 p-0 text-base font-medium bg-transparent focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div>
                    <Label className="text-base font-medium mb-4 block">Who's coming?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label htmlFor="adults" className="text-sm text-muted-foreground">Adults</Label>
                        <Select value={formData.adults} onValueChange={(value) => handleInputChange('adults', value)} disabled={isSubmitting}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(9)].map((_, i) => (
                              <SelectItem key={i} value={String(i + 1)}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="children" className="text-sm text-muted-foreground">Children</Label>
                        <Select value={formData.children} onValueChange={(value) => handleInputChange('children', value)} disabled={isSubmitting}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(6)].map((_, i) => (
                              <SelectItem key={i} value={String(i)}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="infants" className="text-sm text-muted-foreground">Infants</Label>
                        <Select value={formData.infants} onValueChange={(value) => handleInputChange('infants', value)} disabled={isSubmitting}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(4)].map((_, i) => (
                              <SelectItem key={i} value={String(i)}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Any special requests or requirements..."
                      rows={3}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Menu Selection */}
              <MenuSelection 
                selectedItems={selectedMenuItems}
                onItemChange={handleMenuItemChange}
                onTotalChange={handleMenuTotalChange}
              />
            </div>

            {/* Booking Summary */}
            <div className={`space-y-6 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              <Card className="shadow-sm border-primary/20 sticky top-4">
                <CardHeader className="pb-4">
                  <CardTitle className="font-royal text-primary text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.checkIn && formData.checkOut ? (
                    <>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-in:</span>
                          <span className="font-medium">
                            {new Date(formData.checkIn).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-out:</span>
                          <span className="font-medium">
                            {new Date(formData.checkOut).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guests:</span>
                          <span className="font-medium">
                            {Number(formData.adults) + Number(formData.children) + Number(formData.infants)} 
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Room:</span>
                          <span className="font-medium text-xs">Heritage Room - ₹{roomPrice}/night</span>
                        </div>
                        {menuTotal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Food & Beverages:</span>
                            <span className="font-medium">₹{menuTotal}</span>
                          </div>
                        )}
                        
                        {calculateTotal() > 0 && (
                          <>
                            <div className="border-t border-border pt-3 mt-4">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">Total Amount:</span>
                                <div className="flex items-center space-x-1 text-lg font-bold text-primary">
                                  <IndianRupee className="w-4 h-4" />
                                  <span>{calculateTotal().toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              * Secure payment via Razorpay
                            </p>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-6">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Complete the form to see summary</p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting || !currentUser}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Secure payment powered by Razorpay. Your booking will be confirmed after successful payment.
                  </p>
                </CardContent>
              </Card>

              {/* WhatsApp Quick Contact */}
              <Card className="shadow-sm border-primary/10">
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold mb-2 text-sm">Need Help?</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Contact us directly on WhatsApp for instant assistance
                  </p>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                    disabled={isSubmitting}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;