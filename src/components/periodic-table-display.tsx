// src/components/periodic-table-display.tsx
import { CHEMICAL_ELEMENTS, ChemicalElement } from '@/lib/chemical-elements-data';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PeriodicTableDisplayProps {
  highlightedElement: number; // atomicNumber of the element to highlight
}

function getElementPosition(element: ChemicalElement): { gridColumn: string; gridRow: string } {
  let group = element.group;
  let period = element.period;

  // Adjust for Lanthanides and Actinides which are displayed separately
  if (element.atomicNumber >= 57 && element.atomicNumber <= 71) { // Lanthanides
    period = 8;
    group = element.atomicNumber - 57 + 3;
  } else if (element.atomicNumber >= 89 && element.atomicNumber <= 103) { // Actinides
    period = 9;
    group = element.atomicNumber - 89 + 3;
  }
  
  return {
    gridColumn: `${group} / span 1`,
    gridRow: `${period} / span 1`,
  };
}

export function PeriodicTableDisplay({ highlightedElement }: PeriodicTableDisplayProps) {
  const elementsMap = new Map(CHEMICAL_ELEMENTS.map(el => [el.atomicNumber, el]));
  const allElementsToDisplay = [...Array(118)].map((_, i) => elementsMap.get(i + 1));

  return (
    <div className="w-full overflow-x-auto">
      <div className="grid gap-0.5" style={{ 
        gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(9, minmax(0, 1fr))',
       }}>
        <TooltipProvider>
          {allElementsToDisplay.map(el => {
            if (!el) return null;
            const { gridColumn, gridRow } = getElementPosition(el);
            const isHighlighted = el.atomicNumber === highlightedElement;

            return (
              <Tooltip key={el.atomicNumber}>
                <TooltipTrigger asChild>
                  <div
                    style={{ gridColumn, gridRow }}
                    className={cn(
                      'flex flex-col items-center justify-center p-1 rounded-sm text-xs aspect-square border',
                      isHighlighted ? 'ring-2 ring-offset-2 ring-primary-foreground dark:ring-accent scale-110 z-10' : 'border-transparent',
                    )}
                  >
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center rounded-sm transition-transform hover:scale-110" 
                      style={{ backgroundColor: `${el.color}80` }}
                    >
                      <div className="text-[0.6rem] font-bold">{el.atomicNumber}</div>
                      <div className="font-extrabold text-sm">{el.symbol}</div>
                      <div className="hidden sm:block text-[0.5rem] truncate">{el.name}</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">{el.name} ({el.symbol})</p>
                  <p>Atomic Number: {el.atomicNumber}</p>
                  <p className="capitalize">Category: {el.category.replace('-', ' ')}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
       <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          { name: 'Alkali Metal', color: '#ff6961' },
          { name: 'Diatomic Nonmetal', color: '#a8ffc1' },
          { name: 'Noble Gas', color: '#d0bfff' },
          { name: 'Polyatomic Nonmetal', color: '#b3b3b3' },
          { name: 'Transition Metal', color: '#ffc1c1' },
          { name: 'Post-transition Metal', color: '#d1d1e0' },
          { name: 'Actinide', color: '#f8bfff' },
        ].map(cat => (
          <div key={cat.name} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: cat.color }}></div>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
