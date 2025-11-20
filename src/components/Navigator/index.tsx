import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCode, faBook, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { Input } from "components/ui/input";
import { ScrollArea } from "components/ui/scroll-area";
import { Button } from "components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "components/ui/accordion";
import { cn } from "@/lib/utils";

interface NavigatorProps {
  className?: string;
}

const Navigator: React.FC<NavigatorProps> = ({ className }) => {
  // We'll simulate the old "opened" state with Accordion logic
  // But since the original had multiple independent sections, we might just use simple state or multiple accordions.
  // For simplicity and matching the exact behavior, we can keep the state-based open/close or migrate to Accordion.
  // Given the filtering logic, a custom implementation using Shadcn primitives is often cleaner than forcing the Accordion component if filtering dynamically changes structure.
  // However, let's try to modernize.

  const [categoriesOpened, setCategoriesOpened] = useState<Record<string, boolean>>({});
  const [scratchPaperOpened, setScratchPaperOpened] = useState(true);
  const [query, setQuery] = useState('');

  const { categories, scratchPapers } = useAppSelector(state => state.directory);
  const { algorithm, scratchPaper } = useAppSelector(state => state.current);

  const categoryKey = algorithm?.categoryKey;
  const algorithmKey = algorithm?.algorithmKey;
  const gistId = scratchPaper?.gistId;

  const toggleCategory = useCallback((key: string, categoryOpened?: boolean) => {
    setCategoriesOpened(prev => ({
      ...prev,
      [key]: categoryOpened ?? !prev[key],
    }));
  }, []);

  const testQuery = useCallback(
    (value: string) => {
      const refine = (string: string) => string.replace(/-/g, ' ').replace(/[^\w ]/g, '');
      const refinedQuery = refine(query);
      const refinedValue = refine(value);
      return (
        new RegExp(`(^| )${refinedQuery}`, 'i').test(refinedValue) ||
        new RegExp(refinedQuery, 'i').test(
          refinedValue
            .split(' ')
            .map(v => v && v[0])
            .join('')
        )
      );
    },
    [query]
  );

  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    const newCategoriesOpened: Record<string, boolean> = {};
    categories.forEach(category => {
      if (
        testQuery(category.name) ||
        category.algorithms.find(algorithm => testQuery(algorithm.name))
      ) {
        newCategoriesOpened[category.key] = true;
      }
    });
    setCategoriesOpened(newCategoriesOpened);
    setQuery(newQuery);
  };

  useEffect(() => {
    if (algorithm) {
      toggleCategory(algorithm.categoryKey, true);
    }
  }, [algorithm, toggleCategory]);

  // Helper for list items
  const NavItem = ({
    to,
    href,
    label,
    icon,
    indent,
    selected,
    onClick
  }: {
    to?: string,
    href?: string,
    label: React.ReactNode,
    icon?: any,
    indent?: boolean,
    selected?: boolean,
    onClick?: () => void
  }) => {
    const baseClasses = cn(
      "flex items-center w-full rounded transition-all duration-200 cursor-pointer text-sm font-normal",
      indent ? "h-8 px-2 py-1.5 mb-0.5 pl-8" : "h-9 px-2 py-2 mb-1",
      selected && indent && "bg-primary/15 text-primary border-l-2 border-primary font-medium",
      !selected && indent && "hover:bg-accent hover:text-accent-foreground",
      !selected && !indent && "hover:bg-muted"
    );

    const content = (
      <>
        {icon && <FontAwesomeIcon icon={icon} className="mr-2 w-4 h-4" fixedWidth />}
        <span className="truncate flex-1">{label}</span>
      </>
    );

    if (to) {
      return (
        <Link to={to} onClick={onClick} className={baseClasses}>
          {content}
        </Link>
      );
    }
    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={baseClasses}>
          {content}
        </a>
      );
    }
    return (
      <div onClick={onClick} className={baseClasses}>
        {content}
      </div>
    );
  };

  return (
    <nav className={cn("flex flex-col h-full bg-background border-r border-border", className)}>
      <div className="p-2 border-b border-border">
        <div className="relative">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder="Search ..."
            className="pl-8 h-9"
            autoFocus
            value={query}
            onChange={handleChangeQuery}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map(category => {
            const isOpen = categoriesOpened[category.key];
            let algorithms = category.algorithms;
            if (!testQuery(category.name)) {
              algorithms = algorithms.filter(algorithm => testQuery(algorithm.name));
              if (!algorithms.length) return null;
            }
            
                  return (
                    <div key={category.key} className="mb-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-between h-9 font-semibold hover:bg-muted/50 rounded-md"
                        onClick={() => toggleCategory(category.key)}
                      >
                        <span className="truncate">{category.name}</span>
                        <FontAwesomeIcon
                          icon={isOpen ? faChevronDown : faChevronRight}
                          className="h-3 w-3 opacity-50"
                        />
                      </Button>

                      {isOpen && (
                        <div className="mt-2 mb-1">
                          {algorithms.map(algorithm => (
                            <NavItem
                              key={algorithm.key}
                              indent
                              selected={category.key === categoryKey && algorithm.key === algorithmKey}
                              to={`/${category.key}/${algorithm.key}`}
                              label={algorithm.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-2 bg-muted/10">
        <div className="mb-1">
           <Button 
              variant="ghost" 
              className="w-full justify-between h-8 font-semibold"
              onClick={() => setScratchPaperOpened(!scratchPaperOpened)}
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCode} className="mr-2 w-4 h-4" />
                <span>Scratch Paper</span>
              </div>
              <FontAwesomeIcon 
                icon={scratchPaperOpened ? faChevronDown : faChevronRight} 
                className="h-3 w-3 opacity-50" 
              />
            </Button>
            
            {scratchPaperOpened && (
              <div className="mt-1 max-h-40 overflow-y-auto">
                 <NavItem indent label="New ..." to="/scratch-paper/new" />
                 {scratchPapers.map(sp => (
                    <NavItem
                      key={sp.key}
                      indent
                      selected={sp.key === gistId}
                      to={`/scratch-paper/${sp.key}`}
                      label={sp.name}
                    />
                  ))}
              </div>
            )}
        </div>
        
        <NavItem 
          icon={faBook} 
          label="API Reference" 
          href="https://github.com/algorithm-visualizer/algorithm-visualizer/wiki" 
        />
        <NavItem 
          icon={faGithub} 
          label="Fork me on GitHub" 
          href="https://github.com/algorithm-visualizer/algorithm-visualizer" 
        />
      </div>
    </nav>
  );
};

export default Navigator;
