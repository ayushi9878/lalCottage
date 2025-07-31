import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Wifi, Utensils, Trees, Shield, Star, Car, Coffee, Bath } from 'lucide-react';

const RoyalAmenities = () => {
  const { ref, isVisible } = useScrollAnimation();

  const amenities = [
    {
      icon: Wifi,
      title: "Free WiFi",
      description: "High-speed internet throughout the property"
    },
    {
      icon: Utensils,
      title: "Home-Cooked Meals",
      description: "Authentic Rajasthani cuisine prepared fresh daily"
    },
    {
      icon: Trees,
      title: "Huge Terrace Garden",
      description: "Beautiful rooftop garden with panoramic city views"
    },
    {
      icon: Shield,
      title: "Safe & Secure Environment",
      description: "24/7 security and well-lit premises for your peace of mind"
    },
    {
      icon: Car,
      title: "Free Parking",
      description: "Complimentary parking space for your vehicle"
    },
    {
      icon: Coffee,
      title: "Welcome Refreshments",
      description: "Traditional welcome drink and local snacks on arrival"
    },
    {
      icon: Bath,
      title: "Modern Bathrooms",
      description: "Clean, modern facilities with hot water 24/7"
    },
    {
      icon: Star,
      title: "Personalized Service",
      description: "Dedicated staff to make your stay memorable"
    }
  ];

  return (
    <section id="amenities" className="py-20 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div 
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="font-royal text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in-up">
              Royal 
              <span className="block text-transparent bg-gradient-sunset bg-clip-text mt-2">
                Amenities
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-sunset mx-auto mb-8 animate-scale-in animation-delay-300"></div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-rajasthani animate-fade-in-up animation-delay-500">
              Experience luxury and comfort with our carefully curated amenities designed to make 
              your stay at Lal Cottage truly royal and memorable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {amenities.map((amenity, index) => (
              <div 
                key={amenity.title}
                className={`bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-warm hover:shadow-ethnic transition-all duration-300 hover:scale-105 animate-fade-in-up text-center`}
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-sunset rounded-full flex items-center justify-center mb-4 mx-auto">
                  <amenity.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-elegant text-lg font-semibold text-foreground mb-3">
                  {amenity.title}
                </h3>
                <p className="text-muted-foreground text-sm font-rajasthani leading-relaxed">
                  {amenity.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default RoyalAmenities;