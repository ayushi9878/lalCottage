import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Shield, 
  Calendar, 
  Users, 
  MapPin, 
  Coffee,
  Lock,
  CheckCircle,
  Loader2
} from 'lucide-react';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingData = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    if (!window.Razorpay) {
      loadRazorpay();
    } else {
      setRazorpayLoaded(true);
    }

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData.bookingId) {
      toast({
        title: "No Booking Data",
        description: "Please complete the booking form first.",
        variant: "destructive",
      });
      navigate('/booking');
    }
  }, [bookingData, navigate, toast]);

  // Enhanced booking object with proper calculations
  const booking = {
    ...bookingData,
    checkIn: bookingData.checkIn || '2024-02-01',
    checkOut: bookingData.checkOut || '2024-02-03',
    guests: {
      adults: parseInt(bookingData.adults) || 2,
      children: parseInt(bookingData.children) || 0,
      infants: parseInt(bookingData.infants) || 0
    },
    roomPrice: bookingData.roomPrice || 2400,
    nights: bookingData.numberOfNights || Math.ceil((new Date(bookingData.checkOut || '2024-02-03').getTime() - new Date(bookingData.checkIn || '2024-02-01').getTime()) / (1000 * 60 * 60 * 24)),
    selectedItems: bookingData.selectedItems || [],
    menuTotal: bookingData.menuTotal || 0
  };

  const calculateTotal = () => {
    const roomTotal = booking.roomPrice * booking.nights;
    const menuTotal = booking.menuTotal;
    const subtotal = roomTotal + menuTotal;
    const taxes = Math.round(subtotal * 0.18); // 18% GST
    return subtotal + taxes;
  };

  const handlePayment = async () => {
    // DEBUG: If Razorpay window does not open, check the following:
    // 1. Is the Razorpay script loaded? (razorpayLoaded === true)
    // 2. Are both checkboxes checked and button enabled?
    // 3. Does the /create-order request succeed? (Check browser network tab)
    // 4. Are CORS errors shown in the browser console?
    // 5. Is your backend running on http://localhost:8081?
    // 6. Is orderData.key and orderData.orderId present?
    // 7. Are there any JS errors in the console?

    console.log('handlePayment called');
    if (!termsAccepted || !cancellationAccepted) {
      toast({
        title: "Please Accept Terms",
        description: "You must accept the terms and conditions and cancellation policy to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!razorpayLoaded) {
      toast({
        title: "Payment Gateway Loading",
        description: "Please wait for the payment gateway to load and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      console.log('Creating payment order...');
      const orderResponse = await fetch('http://0.0.0.0:10000/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://lal-cottage.web.app'
        },
        body: JSON.stringify({ 
          amount: calculateTotal(),
          currency: 'INR',
          bookingData: booking
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order API error:', errorData);
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      console.log('Order data:', orderData);

      // Configure Razorpay options
      const options = {
        key: orderData.key, // This comes from your API response
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Lal Cottage",
        description: `Booking for ${booking.nights} night(s) - ${booking.bookingId}`,
        image: "/logo.png", // Add your logo
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            console.log('Verifying payment...', response);
            const verifyResponse = await fetch('http://0.0.0.0:10000/verify-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://lal-cottage.web.app'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: booking
              }),
            });

            const verifyData = await verifyResponse.json();
            console.log('Verify data:', verifyData);

            if (verifyData.success) {
              toast({
                title: "Payment Successful!",
                description: `Your booking has been confirmed. Booking ID: ${booking.bookingId}`,
                variant: "default",
              });

              // Navigate to confirmation page
              navigate('/booking-confirmation', {
                state: {
                  ...booking,
                  paymentId: response.razorpay_payment_id,
                  totalAmount: calculateTotal()
                }
              });
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support with your payment details.",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${booking.firstName || ''} ${booking.lastName || ''}`.trim(),
          email: booking.email || '',
          contact: booking.phone || ''
        },
        notes: {
          booking_id: booking.bookingId,
          check_in: booking.checkIn,
          check_out: booking.checkOut,
          guests: `${booking.guests.adults} adults, ${booking.guests.children} children`
        },
        theme: {
          color: "#8B4513" // Your brand color
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can retry the payment when ready.",
              variant: "default",
            });
          }
        }
      };

      if (!window.Razorpay) {
        console.error('Razorpay script not loaded! window.Razorpay is undefined.');
        toast({
          title: 'Payment Gateway Error',
          description: 'Razorpay script not loaded. Please refresh the page.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Initialize and open Razorpay
      console.log('Opening Razorpay window...');
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        console.error('Razorpay payment.failed:', response);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Payment could not be processed. Please try again.",
          variant: "destructive",
        });
      });

      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!bookingData.bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Booking Data Found</h2>
          <p className="text-muted-foreground mb-4">Please complete the booking form first.</p>
          <Button onClick={() => navigate('/booking')}>Go to Booking</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Complete Your Booking</h1>
            <p className="text-muted-foreground mt-1">Booking ID: {booking.bookingId}</p>
          </div>
          <Link to="/booking">
            <Button variant="outline">← Back to Booking</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Lal Cottage
                </CardTitle>
                <CardDescription>Traditional Rajasthani heritage experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-in</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-out</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Guests</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.guests.adults} Adults
                        {booking.guests.children > 0 && `, ${booking.guests.children} Children`}
                        {booking.guests.infants > 0 && `, ${booking.guests.infants} Infants`}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Heritage Room ({booking.nights} nights)</span>
                      <span>₹{(booking.roomPrice * booking.nights).toLocaleString()}</span>
                    </div>
                    
                    {booking.menuTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Coffee className="w-3 h-3" />
                          Food & Beverages
                        </span>
                        <span>₹{booking.menuTotal.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Taxes & Fees (18% GST)</span>
                      <span>₹{Math.round((booking.roomPrice * booking.nights + booking.menuTotal) * 0.18).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>

                {/* Guest Information */}
                <Separator />
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Guest:</strong> {booking.firstName} {booking.lastName}</p>
                  <p><strong>Email:</strong> {booking.email}</p>
                  <p><strong>Phone:</strong> {booking.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Secure payment powered by Razorpay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Payment Method</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setPaymentMethod('razorpay')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Razorpay Gateway</h3>
                          <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking, Wallets</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">UPI</Badge>
                            <Badge variant="secondary" className="text-xs">Cards</Badge>
                            <Badge variant="secondary" className="text-xs">Net Banking</Badge>
                          </div>
                        </div>
                        <Badge variant="default">Recommended</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">Secure Payment</h3>
                      <p className="text-sm text-green-700">
                        Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="mt-1" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="cancellation" 
                      className="mt-1"
                      checked={cancellationAccepted}
                      onChange={(e) => setCancellationAccepted(e.target.checked)}
                    />
                    <label htmlFor="cancellation" className="text-sm text-muted-foreground">
                      I understand the <Link to="/cancellation" className="text-primary hover:underline">Cancellation Policy</Link>
                    </label>
                  </div>
                </div>

                {/* Payment Button */}
                <Button 
                  onClick={handlePayment}
                  className="w-full h-12 text-lg"
                  size="lg"
                  disabled={isProcessing || !termsAccepted || !cancellationAccepted || !razorpayLoaded}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay ₹{calculateTotal().toLocaleString()}
                    </>
                  )}
                </Button>

                {!razorpayLoaded && (
                  <p className="text-sm text-muted-foreground text-center">
                    Loading payment gateway...
                  </p>
                )}

                {/* Payment Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Secure Gateway</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;