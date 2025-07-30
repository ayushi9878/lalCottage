import { useState, useMemo } from 'react';
import { Plus, Minus, Coffee, UtensilsCrossed, Cookie } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'mixers' | 'soft-beverages' | 'chips' | 'eggs' | 'mains' | 'sandwiches' | 'cold-beverages' | 'hot-beverages' | 'special';
  description?: string;
}

interface MenuSelectionProps {
  selectedItems: { [key: string]: number };
  onItemChange: (itemId: string, quantity: number) => void;
  onTotalChange: (total: number) => void;
}

const MenuSelection = ({ selectedItems, onItemChange, onTotalChange }: MenuSelectionProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const menuItems: MenuItem[] = useMemo(() => [
    // Mixers
    { id: 'red-bull', name: 'Red Bull (250 ML)', price: 150, category: 'mixers' },
    { id: 'schweppes-tonic', name: 'Tonic Water (250 ML)', price: 80, category: 'mixers' },
    
    // Soft Beverages
    { id: 'coke-thumbs-sprite', name: 'Coke/Sprite/Thums Up', price: 60, category: 'soft-beverages' },
    { id: 'pepsi', name: 'Pepsi (250 ML)', price: 60, category: 'soft-beverages' },
    
    // Chips
    { id: 'lays-chips', name: 'Lays Chips (50g)', price: 30, category: 'chips' },
    
    // Eggs
    { id: 'masala-omelette', name: 'Masala Omelette', price: 60, category: 'eggs' },
    { id: 'bread-omelette', name: 'Bread Omelette', price: 70, category: 'eggs' },
    { id: 'poached-egg', name: 'Poached Egg', price: 50, category: 'eggs' },
    { id: 'boiled-egg', name: 'Boiled Egg (2 pcs)', price: 40, category: 'eggs' },
    
    // Mains - Paratha Choice
    { id: 'potato-paratha', name: 'Potato Paratha', price: 100, category: 'mains' },
    { id: 'onion-potato-paratha', name: 'Onion Potato Paratha', price: 100, category: 'mains' },
    { id: 'cheese-paratha', name: 'Cheese Paratha', price: 100, category: 'mains' },
    { id: 'cottage-cheese-paratha', name: 'Cottage Cheese Paratha', price: 100, category: 'mains' },
    { id: 'plain-paratha', name: 'Plain Paratha', price: 50, category: 'mains' },
    
    // Sandwiches
    { id: 'cheese-sandwich', name: 'Cheese Sandwich', price: 80, category: 'sandwiches' },
    { id: 'veg-mayo-sandwich', name: 'Veg Mayo Sandwich', price: 80, category: 'sandwiches' },
    { id: 'potato-sandwich', name: 'Potato Sandwich', price: 80, category: 'sandwiches' },
    
    // Cold Beverages
    { id: 'lemon-soda', name: 'Lemon Soda', price: 80, category: 'cold-beverages' },
    { id: 'lemon-water', name: 'Lemon Water', price: 70, category: 'cold-beverages' },
    { id: 'lemon-iced-tea', name: 'Lemon Iced Tea', price: 100, category: 'cold-beverages' },
    
    // Hot Beverages
    { id: 'masala-tea', name: 'Masala Tea', price: 50, category: 'hot-beverages' },
    { id: 'ginger-tea', name: 'Ginger Tea', price: 50, category: 'hot-beverages' },
    { id: 'cardamom-tea', name: 'Cardamom Tea', price: 50, category: 'hot-beverages' },
    
    // Special
    { id: 'mutton-korma', name: 'Mutton Korma', price: 1199, category: 'special', description: 'Slow-cooked tender goat meat with authentic spices (2 hrs)' }
  ], []);

  const categories = useMemo(() => [
    { id: 'hot-beverages', name: 'Tea & Coffee', icon: Coffee },
    { id: 'cold-beverages', name: 'Cold Drinks', icon: Coffee },
    { id: 'soft-beverages', name: 'Sodas', icon: Coffee },
    { id: 'eggs', name: 'Eggs', icon: UtensilsCrossed },
    { id: 'mains', name: 'Parathas', icon: UtensilsCrossed },
    { id: 'sandwiches', name: 'Sandwiches', icon: UtensilsCrossed },
    { id: 'chips', name: 'Snacks', icon: Cookie },
    { id: 'mixers', name: 'Mixers', icon: UtensilsCrossed },
    { id: 'special', name: 'Special Items', icon: UtensilsCrossed }
  ], []);

  const handleQuantityChange = (itemId: string, change: number) => {
    const currentQuantity = selectedItems[itemId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    onItemChange(itemId, newQuantity);
    
    // Calculate total more efficiently
    const updatedItems = { ...selectedItems, [itemId]: newQuantity };
    const total = Object.entries(updatedItems).reduce((sum, [id, quantity]) => {
      const item = menuItems.find(item => item.id === id);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
    
    onTotalChange(total);
  };

  const getTotalSelectedItems = () => {
    return Object.values(selectedItems).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getMenuTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-royal text-lg sm:text-xl">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <span>Food & Beverages</span>
          </div>
          {getTotalSelectedItems() > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary w-fit">
              {getTotalSelectedItems()} items • ₹{getMenuTotal()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const categoryItems = menuItems.filter(item => item.category === category.id);
          if (categoryItems.length === 0) return null;

          const isExpanded = expandedCategory === category.id;
          const hasSelectedItems = categoryItems.some(item => selectedItems[item.id] > 0);

          return (
            <div key={category.id} className="border border-border rounded-lg">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors rounded-t-lg"
              >
                <div className="flex items-center space-x-2">
                  <category.icon className="w-4 h-4 text-primary" />
                  <h4 className="font-medium text-foreground text-left">{category.name}</h4>
                  {hasSelectedItems && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      {categoryItems.reduce((sum, item) => sum + (selectedItems[item.id] || 0), 0)}
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {isExpanded ? '−' : '+'}
                </div>
              </button>
              
              {isExpanded && (
                <div className="border-t border-border">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border-b border-border/50 last:border-b-0">
                      <div className="flex-1 min-w-0 pr-3">
                        <h5 className="font-medium text-sm text-foreground truncate">{item.name}</h5>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-semibold text-primary">₹{item.price}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={!selectedItems[item.id]}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-6 text-center text-sm font-medium">
                          {selectedItems[item.id] || 0}
                        </span>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {getTotalSelectedItems() === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tap categories above to browse menu items</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuSelection;