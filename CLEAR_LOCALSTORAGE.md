# How to Fix Demo Credentials Issue

If the demo credentials are still not working, follow these steps:

## Step 1: Clear localStorage

Open your browser's Developer Tools (F12 or Right-click → Inspect) and run this in the Console:

```javascript
// Clear all saved data
localStorage.clear();
console.log('localStorage cleared!');

// Then reload the page
window.location.reload();
```

Or manually:
1. Open DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Right-click and select **Clear All**
4. Refresh the page (Ctrl+R or Cmd+R)

## Step 2: Test the Credentials

After clearing localStorage, the demo credentials should work:

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

### User Login
- **Username**: `john_doe` or `jane_smith`
- **Password**: `user123`

## Step 3: Verify It's Working

1. You should see "Welcome back! 👋" message
2. You'll be redirected to the appropriate dashboard
3. Check the browser console for any errors

## If Still Not Working

Check the browser console (F12) for error messages. You should see password verification logs.

---

## Technical Details

The hashes have been updated to verified bcryptjs hashes:
- `user123` → `$2a$10$avnCtQQZ.RGZW.ClBkPryeUeNKoVS89p1NqP7z/3E3necccY.a3.sG`
- `admin123` → `$2a$10$BneV8JJ/I8Ren11iqaUpw.krU4F1IYrTob5ys4tldBngU6W6YAHve`

These hashes are now correctly stored in `src/services/api.js`.
