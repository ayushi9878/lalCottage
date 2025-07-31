import { useState } from 'react';
import Calendar from 'react-calendar';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, IndianRupee } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AvailabilityCalendar = () => {
  const [selectedDates, setSelectedDates] = useState<Value>(null);
  const [isRangeSelect, setIsRangeSelect] = useState(false);
  const { ref: calendarRef, isVisible } = useScrollAnimation(0.2);

  // Mock data for booked dates (in real app, this would come from API)
  const bookedDates = [
    new Date(2024, 7, 15),
    new Date(2024, 7, 16),
    new Date(2024, 7, 22),
    new Date(2024, 7, 23),
    new Date(2024, 7, 29),
    new Date(2024, 7, 30),
  ];

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      if (isDateBooked(date)) {
        return 'booked-date';
      }
      if (date < new Date()) {
        return 'past-date';
      }
    }
    return '';
  };

  const calculateNights = () => {
    if (Array.isArray(selectedDates) && selectedDates[0] && selectedDates[1]) {
      const start = selectedDates[0];
      const end = selectedDates[1];
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const pricePerNight = 2400;
    return nights * pricePerNight;
  };

  const roomTypes = [
    { name: "Heritage Deluxe", price: 2400},
  ];

  return (
    <section id="availability" className="py-20 bg-background" ref={calendarRef}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="font-royal text-4xl md:text-5xl font-bold text-foreground mb-4">
            Check Availability
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your dates to see available rooms and pricing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Calendar Card */}
          <Card className={`shadow-warm transition-all duration-700 delay-300 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-royal">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span>Select Your Dates</span>
              </CardTitle>
              <div className="flex items-center space-x-4">
                <Button
                  variant={!isRangeSelect ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsRangeSelect(false)}
                  className="text-sm"
                >
                  Single Date
                </Button>
                <Button
                  variant={isRangeSelect ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsRangeSelect(true)}
                  className="text-sm"
                >
                  Date Range
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <Calendar
                  onChange={setSelectedDates}
                  value={selectedDates}
                  selectRange={isRangeSelect}
                  tileClassName={tileClassName}
                  tileDisabled={({ date }) => isDateBooked(date)}
                  minDate={new Date()}
                  className="custom-calendar w-full border-0 bg-transparent"
                />
              </div>
              
              {/* Legend */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-destructive rounded-sm"></div>
                  <span className="text-sm text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted rounded-sm"></div>
                  <span className="text-sm text-muted-foreground">Past Dates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded-sm"></div>
                  <span className="text-sm text-muted-foreground">Selected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Types & Summary */}
          <div className={`space-y-6 transition-all duration-700 delay-500 ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
            {/* Room Types */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="font-royal">Available Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roomTypes.map((room, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-foreground">{room.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">2 Guests</span>
                        <Badge variant="secondary" className="ml-2">
                          {room.available} Available
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-lg font-bold text-primary">
                        <IndianRupee className="w-4 h-4" />
                        <span>{room.price.toLocaleString()}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">per night</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Booking Summary */}
            {selectedDates && (
              <Card className="shadow-warm border-primary/20">
                <CardHeader>
                  <CardTitle className="font-rajasthani text-primary">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Array.isArray(selectedDates) && selectedDates[0] && selectedDates[1] ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-in:</span>
                          <span className="font-medium">{selectedDates[0].toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-out:</span>
                          <span className="font-medium">{selectedDates[1].toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nights:</span>
                          <span className="font-medium">{calculateNights()}</span>
                        </div>
                        <div className="border-t border-border pt-2 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total:</span>
                            <div className="flex items-center space-x-1 text-xl font-bold text-primary">
                              <IndianRupee className="w-5 h-5" />
                              <span>{calculateTotal().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2" />
                        <p>Select date range to see pricing</p>
                      </div>
                    )}
                  </div>
                  
                  {Array.isArray(selectedDates) && selectedDates[0] && selectedDates[1] && (
                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-ethnic"
                      onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Proceed to Book
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .calendar-container .react-calendar {
          border: none !important;
          background: transparent !important;
          font-family: inherit;
        }
        
        .calendar-container .react-calendar__tile {
          background: transparent;
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          padding: 0.75rem 0.5rem;
          position: relative;
        }
        
        .calendar-container .react-calendar__tile:hover {
          background: hsl(var(--muted));
        }
        
        .calendar-container .react-calendar__tile--active {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
        
        .calendar-container .react-calendar__tile--range {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
        
        .calendar-container .react-calendar__tile--rangeStart,
        .calendar-container .react-calendar__tile--rangeEnd {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
        
        .calendar-container .booked-date {
          background: hsl(var(--destructive)) !important;
          color: hsl(var(--destructive-foreground)) !important;
          cursor: not-allowed;
        }
        
        .calendar-container .past-date {
          background: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
          cursor: not-allowed;
        }
        
        .calendar-container .react-calendar__navigation {
          margin-bottom: 1rem;
        }
        
        .calendar-container .react-calendar__navigation button {
          background: transparent;
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
        }
        
        .calendar-container .react-calendar__navigation button:hover {
          background: hsl(var(--muted));
        }
      `}</style>
    </section>
  );
};

export default AvailabilityCalendar;