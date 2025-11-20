import React, { ReactNode, forwardRef, useImperativeHandle, useState } from 'react';
import { classes } from 'common/util';
import Divider from 'components/Divider';
import styles from './ResizableContainer.module.scss';

interface ResizableContainerProps {
  className?: string;
  children: ReactNode[];
  horizontal?: boolean;
  weights: number[];
  visibles?: boolean[];
  onChangeWeights: (weights: number[]) => void;
}

export interface ResizableContainerRef {
  forceUpdate: () => void;
}

const ResizableContainer = forwardRef<ResizableContainerRef, ResizableContainerProps>(
  ({ className, children, horizontal, weights, visibles, onChangeWeights }, ref) => {
    const [, setUpdateTrigger] = useState(0);

    useImperativeHandle(ref, () => ({
      forceUpdate: () => {
        setUpdateTrigger(prev => prev + 1);
      },
    }));

    const handleResize = (
      prevIndex: number,
      index: number,
      targetElement: HTMLElement,
      clientX: number,
      clientY: number
    ) => {
      const newWeights = [...weights];

      const { left, top } = targetElement.getBoundingClientRect();
      const { offsetWidth, offsetHeight } = targetElement.parentElement!;
      const position = horizontal ? clientX - left : clientY - top;
      const containerSize = horizontal ? offsetWidth : offsetHeight;

      let totalWeight = 0;
      let subtotalWeight = 0;
      newWeights.forEach((weight, i) => {
        if (visibles && !visibles[i]) return;
        totalWeight += weight;
        if (i < index) subtotalWeight += weight;
      });
      const newWeight = (position / containerSize) * totalWeight;
      let deltaWeight = newWeight - subtotalWeight;
      deltaWeight = Math.max(deltaWeight, -newWeights[prevIndex]);
      deltaWeight = Math.min(deltaWeight, newWeights[index]);
      newWeights[prevIndex] += deltaWeight;
      newWeights[index] -= deltaWeight;
      onChangeWeights(newWeights);
    };

    const elements: ReactNode[] = [];
    let lastIndex = -1;
    const totalWeight = weights
      .filter((weight, i) => !visibles || visibles[i])
      .reduce((sumWeight, weight) => sumWeight + weight, 0);

    (children as ReactNode[]).forEach((child, i) => {
      if (!visibles || visibles[i]) {
        if (lastIndex !== -1) {
          const prevIndex = lastIndex;
          elements.push(
            <Divider
              key={`divider-${i}`}
              horizontal={horizontal}
              onResize={(target, dx, dy) => handleResize(prevIndex, i, target, dx, dy)}
            />
          );
        }
        elements.push(
          <div
            key={i}
            className={classes(styles.wrapper)}
            style={{
              flexGrow: weights[i] / totalWeight,
            }}
          >
            {child}
          </div>
        );
        lastIndex = i;
      }
    });

    return (
      <div
        className={classes(styles.resizable_container, horizontal && styles.horizontal, className)}
      >
        {elements}
      </div>
    );
  }
);

ResizableContainer.displayName = 'ResizableContainer';

export default ResizableContainer;
