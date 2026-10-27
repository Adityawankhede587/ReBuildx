import React from 'react';
import {
  Layers,
  Package,
  Boxes,
  Grid,
  Pipette as Pipe,
  Zap,
  Paintbrush,
  DoorOpen,
  TreePine,
  LayoutGrid
} from 'lucide-react';

export const CATEGORIES = [
  { label: 'All Materials', value: 'All', icon: LayoutGrid },
  { label: 'Cement', value: 'Cement', icon: Layers },
  { label: 'Steel & Iron', value: 'Steel & Iron', icon: Boxes },
  { label: 'Bricks & Blocks', value: 'Bricks & Blocks', icon: Package },
  { label: 'Tiles & Marble', value: 'Tiles & Marble', icon: Grid },
  { label: 'Pipes & Plumbing', value: 'Pipes & Plumbing', icon: Pipe },
  { label: 'Electrical', value: 'Electrical', icon: Zap },
  { label: 'Paints & Finishes', value: 'Paints & Finishes', icon: Paintbrush },
  { label: 'Doors & Windows', value: 'Doors & Windows', icon: DoorOpen },
  { label: 'Wood & Timber', value: 'Wood & Timber', icon: TreePine },
];

const CategoryBar = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="category-bar-wrapper">
      <div className="container">
        <div className="category-scroll-container">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = (activeCategory || 'All') === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`category-pill ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
