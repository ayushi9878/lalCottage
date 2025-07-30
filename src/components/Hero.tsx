import { Button } from '@/components/ui/button';
import { Star, MapPin, Wifi, Car, Utensils } from 'lucide-react';
import heroImage from '@/assets/hero-haveli.jpg';

const Hero = () => {
  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Primary dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
        {/* Secondary brand color overlay for visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/25"></div>
        {/* Bottom fade for seamless transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Rating Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 shadow-warm border border-white/20">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-white">4.9 • 127 Reviews</span>
          </div>

          {/* Main Heading */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-sunset opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <h1 className="relative text-center font-royal text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up drop-shadow-2xl">
              <span className="block text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text animate-fade-in-up tracking-wider drop-shadow-lg">
                LAL COTTAGE
              </span>
              <span className="block text-2xl md:text-3xl font-rajasthani text-white/90 mt-2 animate-fade-in-right animation-delay-300 tracking-[0.2em] drop-shadow-lg">
                HOMESTAY
              </span>
            </h1>
          </div>

          {/* Description */}
          <div className="relative">
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed font-rajasthani animate-fade-in-up animation-delay-600 drop-shadow-lg">
              Where luxury meets nature in the heart of Jaipur.
            </p>
          </div>

          {/* Location and Rating */}
          <div className="flex flex-col items-center space-y-2 mb-8 animate-fade-in-up animation-delay-700">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
              <span className="text-white font-medium drop-shadow-lg">Jaipur, Rajasthan</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-medium drop-shadow-lg">4.9/5 Rating</span>
            </div>
          </div>

          {/* Amenities - Centered */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in-up animation-delay-700">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-sm hover:scale-105 transition-all duration-300 border border-white/20 hover:bg-white/20">
              <Wifi className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Free WiFi</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-sm hover:scale-105 transition-all duration-300 border border-white/20 hover:bg-white/20">
              <Car className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Free Parking</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 shadow-sm hover:scale-105 transition-all duration-300 border border-white/20 hover:bg-white/20">
              <Utensils className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Meals</span>
            </div>
          </div>

          {/* CTA Buttons - Centered */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-700">
            <Button 
              onClick={scrollToBooking}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-ethnic text-lg px-8 py-6 hover:scale-105 transition-all duration-300"
            >
              Book Your Stay
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white hover:text-black text-lg px-8 py-6 backdrop-blur-md bg-white/10 hover:scale-105 transition-all duration-300"
              onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Gallery
            </Button>
          </div>

          {/* Price Starting */}
          <div className="mt-8 text-sm text-white/80 animate-fade-in-up animation-delay-700 drop-shadow-lg">
            Starting from <span className="text-2xl font-bold text-yellow-400 font-royal drop-shadow-lg">₹2,400</span> per night
          </div>
        </div>
      </div>

      {/* Floating elements for visual appeal */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-20 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl animate-float animation-delay-1000"></div>
    </section>
  );
};

export default Hero;