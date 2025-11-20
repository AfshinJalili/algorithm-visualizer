[8 tools called]

### **UI Modernization & Improvement Plan**

The current UI uses a dense, utility-focused "dev tool" aesthetic (similar to old IDEs). The color palette is flat, and the spacing is very tight (`12px` font, `32px` line height).

Here are 3 paths to improve the UI, ranging from a quick refresh to a complete overhaul.

---

### **Option 1: The "Fresh Coat of Paint" (Quickest)**
*Goal: Modernize the look without changing layout or rewriting components.*

**1. Modern Color Palette (VS Code Inspired)**
Update `src/common/stylesheet/colors.scss` to use a richer, higher-contrast dark theme.

```scss:src/common/stylesheet/colors.scss
// Modern Dark Theme (VS Code / GitHub Dark inspired)
$theme-dark:   #1e1e1e; // Darker background
$theme-normal: #252526; // Panel background
$theme-light:  #333333; // Borders/Separators
$color-font:   #e0e0e0; // Brighter text (was #bbbbbb)

// Modern Accents
$color-active:   #4caf50; // Material Green
$color-selected: #0984e3; // Vibrant Blue
$color-alert:    #fab1a0; // Soft Warning
$color-shadow:   rgba(0, 0, 0, 0.3);
$color-overlay:  rgba(255, 255, 255, 0.08); // Slightly stronger hover
```

**2. Improve Typography & Spacing**
Update `src/common/stylesheet/dimensions.scss` to increase readability.

```scss:src/common/stylesheet/dimensions.scss
// Increase base size slightly for better readability
$line-height: 40px;       // Was 32px (gives more breathing room)
$font-size-normal: 14px;  // Was 12px (modern standard)
$font-size-large: 16px;   // Was 14px
```

**3. Polish Buttons**
Add rounded corners and better hover states in `src/components/Button/Button.module.scss`.

```scss:src/components/Button/Button.module.scss
.button {
  // ... existing code ...
  border-radius: 6px; // Modern rounded corners
  transition: all 0.2s ease; // Smooth interactions
  
  &:hover {
    transform: translateY(-1px); // Subtle lift effect
  }
  // ... existing code ...
}
```

---

### **Option 2: Component Library Adoption (Recommended)**
*Goal: Replace custom "div-soup" components with accessible, pre-styled professional components.*

I recommend **Radix UI (Headless)** + **Tailwind CSS** or **Shadcn/UI**.

**Why?**
- Your current `Dropdown` logic (in `Header/index.js`) is custom and likely inaccessible (no keyboard nav, screen reader support).
- **Radix UI** handles all the complex accessibility (focus management, keyboard navigation) for you.
- **Tailwind** makes styling instant.

**Example: Replacing the Header Dropdown**

*Current (Custom & brittle):*
```javascript
<div className={styles.btn_dropdown}>
  Sort
  <div className={styles.dropdown}>
     {/* ... items ... */}
  </div>
</div>
```

*New (Radix UI + Tailwind):*
```jsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

<DropdownMenu.Root>
  <DropdownMenu.Trigger className="px-4 py-2 rounded hover:bg-gray-700">
    Sort
  </DropdownMenu.Trigger>
  <DropdownMenu.Content className="bg-gray-800 p-2 rounded shadow-xl">
    <DropdownMenu.Item className="p-2 hover:bg-blue-600 rounded cursor-pointer">
      Bubble Sort
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

---

### **Option 3: Complete Layout Redesign**
*Goal: Move away from the "3-pane" IDE look if it feels cluttered.*

**Ideas:**
1.  **Floating Controls:** Instead of a hard `Header`, make the visualization controls (Play/Pause/Speed) a floating island at the bottom center of the screen (like Mac Dock or Zoom controls).
2.  **Collapsible Sidebar:** Make the "Navigator" (file explorer) strictly collapsible to give maximum space to the code and visualization.
3.  **Glassmorphism:** Use `backdrop-filter: blur(10px)` on panels for a sleek, modern feel.

---

### **My Recommendation**

**Start with Option 1 (Visual Refresh)** immediately. It requires zero code structure changes but makes the app feel 5 years newer.

**Would you like me to apply the new Color Palette and Dimensions now?** (I can provide the exact CSS to copy-do list).