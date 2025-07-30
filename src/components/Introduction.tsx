import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Introduction = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="introduction" className="py-20 bg-gradient-to-br from-warm-cream to-background">
      <div className="container mx-auto px-4">
        <div 
          ref={ref}
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="font-royal text-4xl md:text-5xl font-bold text-foreground mb-8 animate-fade-in-up">
            Welcome to 
            <span className="block text-transparent bg-gradient-primary bg-clip-text mt-2">
              Lal Cottage Heritage
            </span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8 animate-scale-in animation-delay-300"></div>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 font-rajasthani animate-fade-in-up animation-delay-500">
            Lal Cottage isn’t just a place to stay — it’s a space crafted with love, comfort, and a deep respect for nature. As a family-run homestay, we bring together the warmth of traditional Indian hospitality with the convenience of modern living. Our eco-friendly property is powered by solar energy and designed for mindful travel.

          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed font-rajasthani animate-fade-in-up animation-delay-700">
            From the smartly appointed interiors to the playful outdoor space for kids, every corner of Lal Cottage has been curated to offer our guests a truly memorable and peaceful stay in Jaipur.

          </p>
        </div>
      </div>
    </section>
  );
};

export default Introduction;