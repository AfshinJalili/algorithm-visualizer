import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCode, faBook } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ExpandableListItem from 'components/ExpandableListItem';
import ListItem from 'components/ListItem';
import { classes } from 'common/util';
import { useAppSelector } from '../../store';
import styles from './Navigator.module.scss';

interface NavigatorProps {
  className?: string;
}

const Navigator: React.FC<NavigatorProps> = ({ className }) => {
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

  const testQuery = useCallback((value: string) => {
    const refine = (string: string) => string.replace(/-/g, ' ').replace(/[^\w ]/g, '');
    const refinedQuery = refine(query);
    const refinedValue = refine(value);
    return new RegExp(`(^| )${refinedQuery}`, 'i').test(refinedValue) ||
      new RegExp(refinedQuery, 'i').test(refinedValue.split(' ').map(v => v && v[0]).join(''));
  }, [query]);

  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    const newCategoriesOpened: Record<string, boolean> = {};
    categories.forEach(category => {
      if (testQuery(category.name) || category.algorithms.find(algorithm => testQuery(algorithm.name))) {
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

  return (
    <nav className={classes(styles.navigator, className)}>
      <div className={styles.search_bar_container}>
        <FontAwesomeIcon fixedWidth icon={faSearch} className={styles.search_icon}/>
        <input 
          type="text" 
          className={styles.search_bar} 
          aria-label="Search" 
          placeholder="Search ..." 
          autoFocus
          value={query} 
          onChange={handleChangeQuery}
        />
      </div>
      <div className={styles.algorithm_list}>
        {categories.map(category => {
          const categoryOpened = categoriesOpened[category.key];
          let algorithms = category.algorithms;
          if (!testQuery(category.name)) {
            algorithms = algorithms.filter(algorithm => testQuery(algorithm.name));
            if (!algorithms.length) return null;
          }
          return (
            <ExpandableListItem 
              key={category.key} 
              onClick={() => toggleCategory(category.key)}
              label={category.name}
              opened={categoryOpened}
            >
              {algorithms.map(algorithm => (
                <ListItem 
                  indent 
                  key={algorithm.key}
                  selected={category.key === categoryKey && algorithm.key === algorithmKey}
                  to={`/${category.key}/${algorithm.key}`} 
                  label={algorithm.name}
                />
              ))}
            </ExpandableListItem>
          );
        })}
      </div>
      <div className={styles.footer}>
        <ExpandableListItem 
          icon={faCode} 
          label="Scratch Paper" 
          onClick={() => setScratchPaperOpened(!scratchPaperOpened)}
          opened={scratchPaperOpened}
        >
          <ListItem indent label="New ..." to="/scratch-paper/new"/>
          {scratchPapers.map(sp => (
            <ListItem 
              indent 
              key={sp.key} 
              selected={sp.key === gistId}
              to={`/scratch-paper/${sp.key}`} 
              label={sp.name}
            />
          ))}
        </ExpandableListItem>
        <ListItem 
          icon={faBook} 
          label="API Reference"
          href="https://github.com/algorithm-visualizer/algorithm-visualizer/wiki"
        />
        <ListItem 
          icon={faGithub} 
          label="Fork me on GitHub"
          href="https://github.com/algorithm-visualizer/algorithm-visualizer"
        />
      </div>
    </nav>
  );
};

export default Navigator;
