import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import room1 from '@/assets/bedroom night.png';
import roomInside from '@/assets/bed window.png';
import balconyNight from '@/assets/BALCONY  NIGHT.png';
import washroom from '@/assets/WASHROOM.png';
import washroominside from '@/assets/WASHROOM Real.png';
import balcony from '@/assets/BALCONY .png';
import treacrNight from '@/assets/BEAUTIFUL BALCONY VIEW .png';
import terrace from '@/assets/PLAYZONE1.png';
import washbasin from '@/assets/WASHBASINS .png'; 
import washbasinNight from '@/assets/WASHBASIN 3.png';
import smartKey from '@/assets/SMART KEYS .png';
import smartKeys from '@/assets/SMART KEYS PHOTO.png';
const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const { ref: galleryRef, isVisible } = useScrollAnimation(0.2);

  // Gallery sections with multiple photos and hover alternates
  const gallerySections = [
    {
      title: "Rooms",
      description: "Rooms with modern comfort",
      mainImage: roomInside,
      hoverImage: room1,
      category: "accommodation"
    },
    {
      title: "Balcony View",
      description: "Traditional architecture with intricate carvings",
      mainImage: balcony,
      hoverImage: balconyNight,
      category: "architecture"
    },
    {
      title: "Terrace Garden",
      description: "Terrace with plants, perfect for morning tea",
      mainImage: terrace,
      hoverImage: treacrNight,
      category: "views"
    },
    {
      title: "Washroom",
      description: "Washroom with modern amenities",
      mainImage: washroominside,
      hoverImage: washroom,
      category: "dining"
    },
    {
      title: "Washbasin",
      description: "Fun area for kids and families to enjoy their stay",
      mainImage: washbasin,
      hoverImage: washbasinNight,
      category: "ambiance"
    },
    {
      title: "Smart Key Access",
      description: "Safe and secure smart key access for hassle-free check-iny",
      mainImage: smartKeys,
      hoverImage: smartKey,
      category: "interiors"
    }
  ];

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % gallerySections.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + gallerySections.length) % gallerySections.length);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-muted/30" ref={galleryRef}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="font-royal text-4xl md:text-5xl font-bold text-foreground mb-4">
            Heritage Gallery
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the beauty and elegance of our traditional Rajasthani homestay 
            through these carefully curated images
          </p>
        </div>

        {/* Gallery Grid with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallerySections.map((section, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-xl shadow-warm hover:shadow-ethnic transition-all duration-300 cursor-pointer ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                {/* Main Image */}
                <img
                  src={section.mainImage}
                  alt={section.title}
                  className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                />
                
                {/* Hover Image */}
                <img
                  src={section.hoverImage}
                  alt={`${section.title} - alternate view`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-primary/80 uppercase tracking-wider">
                      {section.category}
                    </span>
                  </div>
                  <h3 className="font-royal text-xl font-semibold text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Corner Badge */}
              <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View Details
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>

            {/* Image */}
            <div className="max-w-4xl max-h-[80vh] mx-auto">
              <img
                src={gallerySections[selectedImage].mainImage}
                alt={gallerySections[selectedImage].title}
                className="w-full h-full object-contain rounded-lg"
              />
              
              {/* Image Info */}
              <div className="text-center mt-4">
                <h3 className="font-royal text-2xl font-semibold text-foreground mb-2">
                  {gallerySections[selectedImage].title}
                </h3>
                <p className="text-muted-foreground">
                  {gallerySections[selectedImage].description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;