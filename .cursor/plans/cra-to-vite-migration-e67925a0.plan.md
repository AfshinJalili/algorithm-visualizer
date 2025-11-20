<!-- e67925a0-36a6-462b-9219-b9e68abb6af0 19276bb0-29ca-4368-aff5-38b326a3468d -->
# Merge File Tabs and Toolbar Row

## Goal

Combine the TabContainer (file tabs) and CodeEditor toolbar into one compact row, reducing vertical space from ~70px to ~32px.

## Current State

- **Row 1 (TabContainer)**: File tabs at `h-10` (40px) with tab names, close buttons, and add button
- **Row 2 (CodeEditor toolbar)**: Language/line count + Copy/Download buttons at `py-1.5` (~30px)
- **Total**: ~70px for both rows

## Target State

Single merged row at `h-8` (32px):

```
[Tab1] [Tab2] [Tab3] [+]    JAVASCRIPT • 66 lines  [Copy] [Download]
```

## Implementation Steps

### 1. Update TabContainer Component

**File**: `src/components/TabContainer/index.tsx`

**Changes to tab row (line 61-127):**

- Change height from `h-10` to `h-8` (24px → 32px)
- Reduce tab padding from `px-4` to `px-3`
- Reduce tab heights from `h-10` to `h-8` (line 77)
- Make close button icons smaller: `h-3 w-3` to `h-2.5 w-2.5` (line 111)
- Reduce add button: `h-10 w-10` to `h-8 w-8` (line 121)
- Add right section container for language info and actions (after line 126, before closing div)

**Add new right section (after line 126):**

```tsx
<div className="flex items-center gap-2 px-3 border-l border-border">
  <span className="text-xs text-muted-foreground whitespace-nowrap">
    {/* Language and line count will be passed as props */}
  </span>
  {/* Copy/Download buttons will be passed as children */}
</div>
```

### 2. Update CodeEditor Component  

**File**: `src/components/CodeEditor/index.tsx`

**Remove the toolbar row (lines 72-100):**

- Delete the entire action toolbar div
- Keep the `handleCopyCode` and `handleDownloadCode` functions

**Pass toolbar content to TabContainer:**

- Modify TabContainer to accept `toolbarContent` prop
- Create toolbar JSX fragment with language info and buttons
- Pass it to TabContainer

**Alternative approach (cleaner):**

- Keep TabContainer simple (only handles tabs)
- Move toolbar content into TabContainer's right side via props
- TabContainer becomes: `<TabContainer toolbarLeft={tabs} toolbarRight={actions}>`

### 3. Create Compact Action Buttons

**In CodeEditor, create action buttons fragment:**

```tsx
const toolbarActions = (
  <div className="flex items-center gap-1.5">
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-7 w-7 p-0"
      onClick={handleCopyCode}
      title="Copy code"
    >
      <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
    </Button>
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-7 w-7 p-0"
      onClick={handleDownloadCode}
      title="Download file"
    >
      <FontAwesomeIcon icon={faDownload} className="h-3 w-3" />
    </Button>
  </div>
);
```

### 4. Props Interface Updates

**TabContainer interface:**

```tsx
interface TabContainerProps {
  className?: string;
  children?: ReactNode;
  fileInfo?: ReactNode;  // Language/line count
  actions?: ReactNode;   // Copy/Download buttons
}
```

## Benefits

- Save ~38px vertical space (from ~70px to ~32px)
- More efficient horizontal space usage
- File context (language/lines) visible alongside tabs
- All functionality preserved

## Files to Modify

1. `src/components/TabContainer/index.tsx` - Add right section for info/actions
2. `src/components/CodeEditor/index.tsx` - Remove toolbar, pass content as props

## Testing

- Verify tab switching still works
- Confirm Copy/Download buttons function
- Check tab close and add file buttons work
- Test tab renaming on active tab
- Verify responsive behavior with many tabs
- Check that language/line count updates when switching files

### To-dos

- [ ] Update TabContainer: reduce heights (h-10→h-8), add right section container
- [ ] Remove action toolbar div from CodeEditor (lines 72-100)
- [ ] Add fileInfo and actions props to TabContainer interface
- [ ] Create toolbar content in CodeEditor and pass to TabContainer
- [ ] Test all tab and button interactions in browser