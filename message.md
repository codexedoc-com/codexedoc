### 1. File Vault Uploading Behavior
The file vault must allow clicking the upload box to open the system file picker so the user can select files or folders to upload.

Drag‑and‑drop uploading must work correctly.  
Currently dragging over the box does nothing — fix this so drag‑and‑drop uploads function properly.

---

### 2. File Vault Layout and Folder Creation
Below the upload area, there must be a file/folder navigation menu showing:

- Files  
- Folders  
- The current directory  

Add a “Create Folder” button that lets the user create a new folder inside the vault.

---

### 3. Upload Button Behavior
Add a dedicated “Upload” button.

When the user clicks this button:

- A modal or upload box should appear where they can drag a file/folder  
- OR click to select a file/folder  

This upload box should behave the same as the main upload area.

---

### 4. Password Creation Page (Do NOT change existing design)
Keep the current password creation page exactly as it is, except for the additions below.

#### 4A. Generate Password Button Placement
Add a “Generate Password” button above the password entry fields.

#### 4B. Generate Password Behavior
When the user clicks Generate Password:

- Generate a super‑strong 16‑character password  
- Must include uppercase letters, lowercase letters, numbers, and symbols  
- Automatically fill both password fields (“Password” and “Confirm Password”) with the generated password  
- Display the generated password in an additional box below the fields so the user can write it down  

#### 4C. Text Under the Generate Button
Under the Generate Password button, display this text:

“Generated passwords are extremely strong but harder to remember.”

#### 4D. Security Notice
Also display:

“Your password is only as secure as where you store it.”

---

### 5. Sign‑In Page (Unlocking the Vault)
Implement a progressive lockout system based on failed password attempts.

#### 5A. Lockout Rules
After 5 failed attempts → lock for 5 minutes

After 10 failed attempts → lock for 15 minutes

After 15 failed attempts → lock for 1 hour

After 20 failed attempts → lock for 24 hours

After 25 failed attempts →

- Permanently reset the vault  
- Delete all vault data and the stored password hash  
- Next time the app opens, it behaves like a fresh install and requires creating a new password  

#### 5B. Persistence Requirement
Failed attempt counts and lockout timers must be saved in persistent storage so they remain even if:

- The user closes the app  
- The computer restarts  
- The device is powered off  

#### 5C. Resetting Attempts
If the user successfully enters the correct password before reaching 25 failed attempts, then:

- Reset the failed attempt counter to zero  
- Clear all lockout timers  

#### 5D. User Feedback
Display clear messages based on the lockout stage:

After 5 failed attempts:  
“Try again in 5 minutes.”

After 10 failed attempts:  
“Try again in 15 minutes.”

After 15 failed attempts:  
“Try again in 1 hour.”

After 20 failed attempts:  
“Try again in 24 hours.”

During the final stage (20–25 attempts):  
“After X more failed attempts, your vault will be permanently deleted.”  
(X = remaining attempts before reaching 25)

---

I need you to implement a universal file viewer system inside my vault app. The goal is that any file type a user uploads can be displayed inside the app without downloading. This includes PDFs, images, videos, audio, text files, Office files, ZIP files, and any other file type. Everything must stay inside the vault and never be written to disk in plaintext.

### Universal Viewer Requirements
Create a single UniversalViewer component that handles all file types.

The UniversalViewer should:

- Receive decrypted file bytes from Rust.  
- Convert the bytes into a Blob URL.  
- Detect the file’s MIME type or extension.  
- Route the file to the correct viewer:
  - PDFViewer  
  - ImageViewer  
  - VideoViewer  
  - AudioViewer  
  - TextViewer  
  - OfficeViewer (if supported)  
  - FallbackViewer (for unsupported types)  

The UniversalViewer must be the only entry point for displaying files.

### Viewer Behavior
PDFs: Display using an iframe, embed, or a PDF viewer library.

Images: Display using an `<img>` tag.

Videos: Display using a `<video controls>` element.

Audio: Display using an `<audio controls>` element.

Text files: Convert bytes to string and show in a text viewer.

Office files: Use a viewer library if available.

Unknown file types: Show a fallback preview with file name, size, and type, and a message like “Preview not available, but the file is securely stored.”

### Security Requirements
Files must only be decrypted in memory.

Blob URLs must be used for display.

No plaintext files should ever be written to disk.

No forced downloads — everything must display inside the vault.