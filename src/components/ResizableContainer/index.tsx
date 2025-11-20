import React, { ReactNode, forwardRef, useImperativeHandle } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "components/ui/resizable";
import { cn } from "@/lib/utils";

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

// Shadcn's Resizable (react-resizable-panels) uses "defaultSize" (percentage) or imperative API for sizing.
// Our existing logic uses explicit "weights" passed from parent state (Redux) and expects to control them.
// `react-resizable-panels` is uncontrolled by default but provides `onLayout` callback to sync state.
// To make it fully controlled or at least sync with our Redux state, we can use `defaultSize` initially 
// and update the Redux state via `onLayout`.
// However, `react-resizable-panels` documentation advises against controlling `defaultSize` dynamically 
// to drive resizing from outside unless you remount the component or use the imperative API.
// Given we want to persist layouts, we'll map our "weights" (which are ratios) to percentages.

const ResizableContainer = forwardRef<ResizableContainerRef, ResizableContainerProps>(
  ({ className, children, horizontal, weights, visibles, onChangeWeights }, ref) => {
    
    // Provide a dummy forceUpdate to satisfy the Ref interface, 
    // though Shadcn/Radix handles layout updates automatically.
    useImperativeHandle(ref, () => ({
      forceUpdate: () => {
        // No-op for this implementation as react-resizable-panels handles resize events internally
      },
    }));

    // Calculate total weight of VISIBLE panels only
    const validIndices: number[] = [];
    children.forEach((_, i) => {
       if (!visibles || visibles[i]) {
         validIndices.push(i);
       }
    });

    const totalWeight = validIndices.reduce((sum, index) => sum + weights[index], 0);
    
    // Map visible children to Panels
    const panels: ReactNode[] = [];
    validIndices.forEach((originalIndex, i) => {
      const child = children[originalIndex];
      const weight = weights[originalIndex];
      const percentage = (weight / totalWeight) * 100;
      
      // Add Handle before every panel except the first one
      if (i > 0) {
        panels.push(<ResizableHandle key={`handle-${originalIndex}`} />);
      }
      
      panels.push(
        <ResizablePanel 
          key={`panel-${originalIndex}`}
          defaultSize={percentage}
          minSize={0} // Allow collapsing
          className="flex flex-col min-h-0 min-w-0 overflow-hidden bg-background"
        >
          {child}
        </ResizablePanel>
      );
    });

    const handleLayout = (sizes: number[]) => {
      // sizes are percentages of the visible group.
      // We need to map these back to the original weights structure.
      // We'll assume the total weight should remain constant or just distribute 100 units.
      // But existing app might expect specific weight sums. 
      // Let's just normalize the visible weights based on the new sizes 
      // and keep invisible weights as is.
      
      // The `onChangeWeights` expects the full array of weights (including invisible ones).
      const newWeights = [...weights];
      
      // sizes[i] corresponds to validIndices[i]
      sizes.forEach((size, i) => {
        const originalIndex = validIndices[i];
        // If totalWeight was, say, 10, and size is 50%, new weight is 5.
        // This preserves the scale of weights the app expects.
        newWeights[originalIndex] = (size / 100) * totalWeight;
      });
      
      onChangeWeights(newWeights);
    };

    return (
      <ResizablePanelGroup
        direction={horizontal ? "horizontal" : "vertical"}
        className={cn("w-full h-full", className)}
        onLayout={handleLayout}
      >
        {panels}
      </ResizablePanelGroup>
    );
  }
);

ResizableContainer.displayName = 'ResizableContainer';

export default ResizableContainer;
