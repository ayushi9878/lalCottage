import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Introduction from '@/components/Introduction';
// import TraditionalFood from '@/components/TraditionalFood';
import RoyalAmenities from '@/components/RoyalAmenities';
import Gallery from '@/components/Gallery';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import BookingForm from '@/components/BookingForm';
import MenuSelection from '@/components/MenuSelection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Introduction />
      <Gallery />
      <RoyalAmenities />
      <AvailabilityCalendar />
      <BookingForm />
      <Footer />
    </div>
  );
};

export default Index;
