import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Footer = () => {
  const { ref: footerRef, isVisible } = useScrollAnimation(0.2);
  
  return (
    <footer id="contact" className="bg-gradient-to-br from-maroon to-terracotta text-primary-foreground" ref={footerRef}>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className={`lg:col-span-1 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center animate-float">
                <span className="text-primary-foreground font-bold text-lg font-royal">LC</span>
              </div>
              <div>
                <h3 className="font-royal font-bold text-lg">Lal Cottage</h3>
                <p className="text-xs opacity-90 font-rajasthani">Jaipur</p>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-4">
              Experience authentic Rajasthani hospitality in our heritage homestay. 
              Immerse yourself in the royal culture and traditions of the Land of Kings.
            </p>
            
            {/* Reviews Badge */}
            <div className="flex items-center space-x-2 bg-primary-foreground/10 rounded-full px-3 py-2 inline-flex">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-mustard text-mustard" />
                ))}
              </div>
              <span className="text-xs">4.9 • 127 Reviews</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h4 className="font-royal font-semibold text-lg mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5 opacity-90 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Heritage Haveli</p>
                  <p className="text-sm opacity-90">
                    123 Jaipur Heritage District,<br />
                    Pink City, Jaipur - 302001,<br />
                    Rajasthan, India
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 opacity-90" />
                <div>
                  <p className="text-sm font-medium">+91 98765 43210</p>
                  <p className="text-xs opacity-75">24/7 Available</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 opacity-90" />
                <div>
                  <p className="text-sm font-medium">info@rajasthaniheritage.com</p>
                  <p className="text-xs opacity-75">Quick Response</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`transition-all duration-700 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h4 className="font-royal font-semibold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Gallery', href: '#gallery' },
                { label: 'Availability', href: '#availability' },
                { label: 'Book Now', href: '#booking' },
                { label: 'About Us', href: '#about' },
                { label: 'Reviews', href: '#reviews' },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => document.getElementById(link.href.slice(1))?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-sm opacity-90 hover:opacity-100 hover:text-mustard transition-all duration-200"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className={`transition-all duration-700 delay-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h4 className="font-royal font-semibold text-lg mb-4">Stay Connected</h4>
            
            {/* Social Media */}
            <div className="flex space-x-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground p-2"
                onClick={() => window.open('https://facebook.com', '_blank')}
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground p-2"
                onClick={() => window.open('https://instagram.com', '_blank')}
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground p-2"
                onClick={() => window.open('https://twitter.com', '_blank')}
              >
                <Twitter className="w-4 h-4" />
              </Button>
            </div>

            {/* WhatsApp Contact */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
              onClick={() => window.open('https://wa.me/919876543210', '_blank')}
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp Us
            </Button>

            {/* Operating Hours */}
            <div className="bg-primary-foreground/10 rounded-lg p-3">
              <h5 className="font-semibold text-sm mb-2">Operating Hours</h5>
              <div className="text-xs space-y-1 opacity-90">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>2:00 PM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>10:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Reception:</span>
                  <span>24/7 Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm opacity-90">
              <p>&copy; 2024 Lal Cottage Jaipur. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6 text-sm opacity-90">
              <button className="hover:opacity-100 transition-opacity">Privacy Policy</button>
              <button className="hover:opacity-100 transition-opacity">Terms of Service</button>
              <button className="hover:opacity-100 transition-opacity">Cancellation Policy</button>
            </div>
          </div>
          
          <div className="text-center mt-4 text-xs opacity-75">
            <p>Built with ❤️ for preserving Rajasthani heritage and culture</p>
          </div>
        </div>
      </div>

      {/* Decorative Pattern */}
      <div className="h-2 bg-gradient-to-r from-mustard via-terracotta to-indigo"></div>
    </footer>
  );
};

export default Footer;