# Kanban Editing E2E Test Scenarios

## Overview
End-to-end test scenarios for AC-022 (Inline Card Editing) and AC-023 (Task Creation Modal) to validate the user experience flows and accessibility requirements.

---

## AC-022: Inline Card Editing Validation

### Test Suite: Inline Field Editing

#### TC-022-001: Title Field Inline Edit
**Objective:** Verify inline editing of task titles with proper validation and autosave.

**Preconditions:**
- Kanban board with at least one task in any column
- User logged in and viewing the board

**Test Steps:**
1. **Enter Edit Mode**
   - Click on a task title
   - Verify input field appears with current title value
   - Verify focus is on the input field
   - Verify save/cancel buttons appear below the field

2. **Edit Title**
   - Type a new title (e.g., "Updated Task Title")
   - Verify input expands to accommodate text
   - Verify placeholder shows previous value

3. **Save Changes**
   - Press Enter key
   - Verify green checkmark appears indicating autosave success
   - Verify new title is displayed on the card
   - Verify save/cancel buttons disappear

4. **Cancel Changes**
   - Click on the same title again
   - Modify the text
   - Press Esc key
   - Verify original title is restored
   - Verify edit mode is exited

**Expected Results:**
- Title field becomes editable on single click
- Changes autosave within 1 second
- Save indicator shows success state
- Cancel restores previous value
- Edit mode exits cleanly

---

#### TC-022-002: Priority Field Inline Edit
**Objective:** Verify inline editing of task priority with dropdown selection.

**Preconditions:**
- Kanban board with at least one task
- Task has a priority set

**Test Steps:**
1. **Enter Priority Edit Mode**
   - Click on priority chip/indicator
   - Verify dropdown opens with current priority highlighted
   - Verify all priority options are visible (Low, Medium, High, Critical)

2. **Change Priority**
   - Select a different priority from dropdown
   - Verify dropdown closes automatically
   - Verify new priority is displayed with appropriate styling
   - Verify autosave indicator appears

3. **Keyboard Navigation**
   - Press E key to enter edit mode
   - Use arrow keys to navigate priority options
   - Press Enter to select
   - Press Esc to cancel

**Expected Results:**
- Priority becomes editable on click
- Dropdown shows all options with current selection
- Changes persist immediately
- Keyboard navigation works correctly

---

#### TC-022-003: Due Date Field Inline Edit
**Objective:** Verify inline editing of due dates with date picker.

**Preconditions:**
- Kanban board with at least one task
- Task has a due date set

**Test Steps:**
1. **Enter Date Edit Mode**
   - Click on due date field
   - Verify date picker opens
   - Verify current date is selected
   - Verify calendar navigation is accessible

2. **Select New Date**
   - Navigate to a different date
   - Click to select
   - Verify date picker closes
   - Verify new date is displayed
   - Verify overdue indicator updates if applicable

3. **Clear Due Date**
   - Click on due date field
   - Click "Clear" or "Remove" option
   - Verify due date is removed from display
   - Verify overdue indicator disappears

**Expected Results:**
- Date picker opens on click
- Date selection updates immediately
- Overdue state updates in real-time
- Date can be cleared

---

#### TC-022-004: Tags Field Inline Edit
**Objective:** Verify inline editing of task tags with autocomplete.

**Preconditions:**
- Kanban board with at least one task
- Task has existing tags

**Test Steps:**
1. **Enter Tags Edit Mode**
   - Click on tags area
   - Verify tag input appears
   - Verify existing tags are shown as removable chips
   - Verify input field is focused

2. **Add New Tag**
   - Type a new tag name
   - Verify autocomplete suggestions appear
   - Select a suggestion or press Enter to create new
   - Verify tag is added to the task
   - Verify autosave occurs

3. **Remove Existing Tag**
   - Click the X on an existing tag chip
   - Verify tag is removed immediately
   - Verify autosave occurs

4. **Tag Validation**
   - Try to add an empty tag
   - Verify validation error appears
   - Try to add a very long tag (>50 characters)
   - Verify length validation works

**Expected Results:**
- Tags become editable on click
- Autocomplete suggests existing tags
- Tags can be added and removed
- Validation prevents invalid tags
- Changes autosave immediately

---

#### TC-022-005: Keyboard-Only Editing Flow
**Objective:** Verify complete keyboard accessibility for inline editing.

**Preconditions:**
- Kanban board with at least one task
- User navigates using keyboard only

**Test Steps:**
1. **Navigate to Task**
   - Use Tab to navigate to a task card
   - Verify focus indicator is visible
   - Press E key to enter edit mode

2. **Navigate Between Fields**
   - Use Tab to move between editable fields
   - Use Shift+Tab to move backwards
   - Verify focus moves logically between fields

3. **Edit and Save**
   - Modify a field value
   - Press Enter to save
   - Verify changes persist
   - Verify focus returns to appropriate location

4. **Cancel and Exit**
   - Enter edit mode again
   - Make changes
   - Press Esc to cancel
   - Verify original values are restored

**Expected Results:**
- All editing functions accessible via keyboard
- Tab order follows logical workflow
- Enter saves, Esc cancels
- Focus management works correctly

---

#### TC-022-006: Autosave and Error Handling
**Objective:** Verify autosave behavior and error handling.

**Preconditions:**
- Kanban board with at least one task
- Network conditions that may cause save delays

**Test Steps:**
1. **Successful Autosave**
   - Edit a task field
   - Verify autosave indicator appears
   - Verify green checkmark shows on completion
   - Verify changes persist after page refresh

2. **Error Handling**
   - Simulate network error during save
   - Verify error indicator (red X) appears
   - Verify optimistic update is rolled back
   - Verify error message is announced to screen reader

3. **Validation Errors**
   - Try to save empty title
   - Verify inline error message appears
   - Verify error is announced to screen reader
   - Verify save is prevented until valid

**Expected Results:**
- Autosave completes within 1 second
- Success/error states are clearly indicated
- Validation errors prevent invalid saves
- Screen reader announcements work correctly

---

## AC-023: Task Creation Modal Validation

### Test Suite: Modal Behavior and Launch

#### TC-023-001: Modal Launch from Column Quick Add
**Objective:** Verify modal opens correctly from column footer.

**Preconditions:**
- Kanban board with at least one column
- User viewing the board

**Test Steps:**
1. **Launch Modal**
   - Click "Quick Add" button in column footer
   - Verify modal opens with overlay
   - Verify modal is centered on screen
   - Verify focus is on Title field

2. **Modal Content**
   - Verify "Create New Task" header is visible
   - Verify all form fields are present
   - Verify Status field shows column name
   - Verify Priority defaults to "Medium"

3. **Close Modal**
   - Click close button (X)
   - Verify modal closes
   - Verify focus returns to Quick Add button
   - Press Esc key
   - Verify modal opens again

**Expected Results:**
- Modal opens from Quick Add button
- Focus is properly managed
- Status is preselected by column
- Modal can be closed and reopened

---

#### TC-023-002: Global Shortcut Launch
**Objective:** Verify modal opens from global keyboard shortcut.

**Preconditions:**
- User viewing any page of the application

**Test Steps:**
1. **Use Global Shortcut**
   - Press Ctrl+N (or Cmd+N on Mac)
   - Verify modal opens
   - Verify Status defaults to "Draft"
   - Verify Title field is focused

2. **Keyboard Navigation**
   - Use Tab to navigate through form fields
   - Verify focus order is logical
   - Use Shift+Tab to navigate backwards
   - Verify focus trap prevents escape

**Expected Results:**
- Global shortcut opens modal
- Status defaults to "Draft"
- Keyboard navigation works correctly
- Focus trap prevents escape

---

#### TC-023-003: Empty State Launch
**Objective:** Verify modal opens from empty column state.

**Preconditions:**
- Kanban board with at least one empty column

**Test Steps:**
1. **Empty State Display**
   - Navigate to empty column
   - Verify "Add your first task" CTA is visible
   - Verify CTA is prominent and clickable

2. **Launch from Empty State**
   - Click on empty state CTA
   - Verify modal opens
   - Verify Status is preselected for the column
   - Verify Title field is focused

**Expected Results:**
- Empty state CTA is visible and clickable
- Modal opens with correct status preselected
- Focus management works correctly

---

#### TC-023-004: Form Validation and Submission
**Objective:** Verify form validation and submission behavior.

**Preconditions:**
- Task creation modal is open

**Test Steps:**
1. **Required Field Validation**
   - Leave Title field empty
   - Try to submit form
   - Verify error message appears below Title
   - Verify submit button is disabled
   - Verify error is announced to screen reader

2. **Valid Submission**
   - Enter valid title
   - Verify error message disappears
   - Verify submit button is enabled
   - Click "Create" button
   - Verify task is created in target column
   - Verify modal closes

3. **Create and Add Another**
   - Open modal again
   - Fill out form completely
   - Click "Create & Add Another"
   - Verify task is created
   - Verify modal stays open
   - Verify form fields are reset
   - Verify Title field is focused

**Expected Results:**
- Required field validation works
- Error messages are clear and accessible
- Submit creates task successfully
- Create & Add Another resets form appropriately

---

#### TC-023-005: Accessibility Features
**Objective:** Verify accessibility compliance for screen readers and keyboard users.

**Preconditions:**
- Task creation modal is open
- Screen reader is active

**Test Steps:**
1. **Screen Reader Announcements**
   - Verify modal opening is announced
   - Verify field labels are properly announced
   - Verify validation errors are announced
   - Verify submission success is announced

2. **Keyboard Accessibility**
   - Verify Tab navigation works correctly
   - Verify Enter submits form when valid
   - Verify Esc closes modal
   - Verify focus trap prevents escape

3. **Focus Management**
   - Verify focus moves to first error field on validation failure
   - Verify focus returns to appropriate location after modal closes
   - Verify focus indicators are clearly visible

**Expected Results:**
- All announcements are clear and helpful
- Keyboard navigation is complete
- Focus management works correctly
- Accessibility standards are met

---

#### TC-023-006: Modal Performance and Responsiveness
**Objective:** Verify modal performance meets requirements.

**Preconditions:**
- Task creation modal is open
- Application under normal load

**Test Steps:**
1. **Open Performance**
   - Measure time from click to modal fully visible
   - Verify modal opens within 200ms

2. **Submit Performance**
   - Fill out form completely
   - Click Create button
   - Measure time to task creation and modal close
   - Verify task creation completes within 1 second

3. **Responsiveness**
   - Resize browser window while modal is open
   - Verify modal remains centered and usable
   - Verify form fields remain accessible

**Expected Results:**
- Modal opens within 200ms
- Task creation completes within 1 second
- Modal remains responsive to window changes

---

## Test Data Requirements

### Test Users
- **Standard User:** Regular user with basic permissions
- **Accessibility Tester:** User relying on screen reader and keyboard navigation

### Test Data
- **Sample Tasks:** Various task types with different priorities, due dates, and tags
- **Sample Tags:** Common tags used across multiple tasks
- **Edge Cases:** Very long titles, special characters, empty values

### Test Environment
- **Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **Devices:** Desktop, tablet, mobile
- **Accessibility Tools:** Screen readers (NVDA, JAWS, VoiceOver)
- **Network Conditions:** Normal, slow, offline scenarios

---

## Success Criteria

### AC-022 Success Criteria
- [ ] All inline editing functions work correctly
- [ ] Keyboard navigation is complete and logical
- [ ] Autosave completes within 1 second
- [ ] Validation errors are clear and accessible
- [ ] Undo functionality works correctly
- [ ] Changes persist across page refreshes

### AC-023 Success Criteria
- [ ] Modal opens from all launch points
- [ ] Form validation prevents invalid submissions
- [ ] Task creation completes within 1 second
- [ ] Create & Add Another works correctly
- [ ] Accessibility requirements are met
- [ ] Performance targets are achieved

### Overall Success
- [ ] All test scenarios pass consistently
- [ ] No accessibility violations
- [ ] Performance meets requirements
- [ ] User experience is smooth and intuitive
