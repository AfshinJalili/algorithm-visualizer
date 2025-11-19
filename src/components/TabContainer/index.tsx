import React, { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { classes } from 'common/util';
import { languages } from 'common/config';
import { useAppSelector, useAppDispatch } from '../../store';
import { setEditingFile, addFile, renameFile } from '../../reducers';
import styles from './TabContainer.module.scss';

interface TabContainerProps {
  className?: string;
  children?: ReactNode;
}

const TabContainer: React.FC<TabContainerProps> = ({ className, children }) => {
  const dispatch = useAppDispatch();
  const { editingFile, files } = useAppSelector(state => state.current);
  const { ext } = useAppSelector(state => state.env);

  const handleAddFile = () => {
    const language = languages.find(language => language.ext === ext);
    if (!language) return;
    
    const newFile = { ...language.skeleton };
    let count = 0;
    while (files.some(file => file.name === newFile.name)) {
      newFile.name = `code-${++count}.${ext}`;
    }
    dispatch(addFile(newFile));
  };

  return (
    <div className={classes(styles.tab_container, className)}>
      <div className={styles.tab_bar}>
        <div className={classes(styles.title, styles.fake)}/>
        {files.map((file, i) => file === editingFile ? (
          <div 
            className={classes(styles.title, styles.selected)} 
            key={i}
            onClick={() => dispatch(setEditingFile(file))}
          >
            <input 
              className={styles.input_title} 
              value={file.name}
              onClick={e => e.stopPropagation()}
              onChange={e => dispatch(renameFile({ file, name: e.target.value }))}
            />
          </div>
        ) : (
          <div 
            className={styles.title} 
            key={i} 
            onClick={() => dispatch(setEditingFile(file))}
          >
            {file.name}
          </div>
        ))}
        <div className={styles.title} onClick={handleAddFile}>
          <FontAwesomeIcon fixedWidth icon={faPlus}/>
        </div>
        <div className={classes(styles.title, styles.fake)}/>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default TabContainer;
