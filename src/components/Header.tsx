import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, User, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '../firebase';
import logo from '@/assets/logo.png';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-warm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
           <div className="flex items-center space-x-2">
            <div className="w-19 h-16  flex items-center justify-center overflow-hidden">
              <img 
                src={logo} 
                alt="Lal Cottage Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-royal font-bold text-lg text-foreground">
                Lal Cottage
              </h1>
              <p className="text-xs text-muted-foreground font-rajasthani">Jaipur</p>
            </div>
          </div>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('gallery')}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Gallery
            </button>
            <button 
              onClick={() => scrollToSection('availability')}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Availability
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contact
            </button>
          </nav>

          {/* Contact Info & Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-7 ">
              {!currentUser ? (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    <LogIn className="w-4 h-4 mr-1 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-ethnic" />
                    Login
                  </Button>
                </Link>
              ) : (
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1 group-hover:bg-accent bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-ethnic" onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-1" />
                    Profile
                  </Button>
                </div>
              )}
              <Button 
                onClick={() => scrollToSection('booking')}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-ethnic"
              >
                Book Now
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('gallery')}
                className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Gallery
              </button>
              <button 
                onClick={() => scrollToSection('availability')}
                className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Availability
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Contact
              </button>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground py-2">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex flex-col space-y-2 pt-2">
                {!currentUser ? (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start flex items-center gap-1" onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start flex items-center gap-1 text-destructive" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => scrollToSection('booking')}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-ethnic w-full"
                >
                  Book Now
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;