// components/BookingConfirmation.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Home,
  Share2
} from 'lucide-react';

interface ConfirmationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  infants: string;
  numberOfNights: number;
  totalAmount: number;
  bookingId: string;
  paymentId: string;
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    if (location.state) {
      setBookingData(location.state as ConfirmationData);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleDownloadReceipt = () => {
    // Implement PDF generation logic here
    console.log('Downloading receipt for booking:', bookingData?.bookingId);
  };

  const handleShareBooking = async () => {
    if (navigator.share && bookingData) {
      try {
        await navigator.share({
          title: 'Lal Cottage Booking Confirmation',
          text: `My booking at Lal Cottage has been confirmed! Booking ID: ${bookingData.bookingId}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (!bookingData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-royal text-3xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you for choosing Lal Cottage. Your royal experience awaits!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Details</span>
                  <Badge variant="default" className="bg-green-600">
                    Confirmed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">GUEST INFORMATION</h3>
                    <p className="font-medium">{bookingData.firstName} {bookingData.lastName}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.email}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">BOOKING REFERENCE</h3>
                    <p className="font-mono text-lg font-bold text-primary">{bookingData.bookingId}</p>
                    <p className="text-sm text-muted-foreground">Payment ID: {bookingData.paymentId}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">STAY DETAILS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Check-in</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(bookingData.checkIn).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">After 2:00 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Check-out</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(bookingData.checkOut).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">Before 11:00 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{bookingData.numberOfNights} Night(s)</p>
                        <p className="text-sm text-muted-foreground">
                          {Number(bookingData.adults) + Number(bookingData.children) + Number(bookingData.infants)} Guests
                        </p>
                        <p className="text-xs text-muted-foreground">Heritage Room</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Property Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Lal Cottage</h3>
                    <p className="text-sm text-muted-foreground">
                      Traditional Rajasthani Heritage Stay
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      123 Heritage Street, Old City, Jaipur, Rajasthan 302001
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Property
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>You'll receive a confirmation email with your booking details within 5 minutes.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>Our team will contact you 24 hours before check-in to arrange your arrival.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>Check-in is available from 2:00 PM. Early check-in may be available upon request.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>For any changes or special requests, please contact us at least 24 hours in advance.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-semibold">₹{bookingData.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <Badge variant="default" className="bg-green-600 text-xs">
                      Completed
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleDownloadReceipt}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                  
                  <Button 
                    onClick={handleShareBooking}
                    className="w-full"
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Booking
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Our team is here to help with any questions about your booking.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.open('tel:+919876543210')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      +91 98765 43210
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.open('mailto:bookings@lalcottage.com')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      bookings@lalcottage.com
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Free cancellation up to 48 hours before check-in</p>
                  <p>• 50% refund for cancellations 24-48 hours before</p>
                  <p>• No refund for cancellations within 24 hours</p>
                  <p className="text-primary font-medium mt-3">
                    Contact us for modifications or cancellations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="font-royal text-lg font-semibold text-primary mb-2">
            Welcome to the Royal Experience!
          </h3>
          <p className="text-sm text-muted-foreground">
            We're excited to host you at Lal Cottage. Get ready for an authentic Rajasthani heritage experience 
            with traditional hospitality, local cuisine, and cultural immersion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;