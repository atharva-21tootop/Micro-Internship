# Quick Reference - New Components & Features

## 🆕 NEW COMPONENTS

### 1. ResumePreviewModal
**Location**: `client/src/components/common/ResumePreviewModal.jsx`

**Props**:
```javascript
<ResumePreviewModal 
  profile={userData} // User profile object with name, email, skills, etc.
  onClose={() => {}}  // Callback when modal closes
/>
```

**Used in**: Profile.jsx

**Features**:
- Displays profile data in professional resume format
- Print-to-PDF via browser print dialog
- Responsive modal with smooth animations
- Shows contact info, skills, interests, education, bio

---

### 2. RecommendationCard
**Location**: `client/src/components/common/RecommendationCard.jsx`

**Props**:
```javascript
<RecommendationCard 
  internship={internshipObject} // Internship data
  matchScore={80}               // Match percentage 0-100
  onApply={() => {}}            // Apply button handler
/>
```

**Used in**: StudentDashboard.jsx

**Features**:
- Shows internship with match percentage
- Color-coded badges (green/blue/orange/red)
- Tags for skills
- Quick apply button
- Location and duration display

---

## 🔄 MODIFIED COMPONENTS

### Profile.jsx Changes
```javascript
// NEW IMPORT
import ResumePreviewModal from '@/components/common/ResumePreviewModal'

// IN JSX - replaced old modal with:
{resumePreview && (
  <ResumePreviewModal 
    profile={{ ...userData, ...formData }} 
    onClose={() => setResumePreview(null)} 
  />
)}
```

### StudentDashboard.jsx Changes
```javascript
// NEW IMPORT
import RecommendationCard from '@/components/common/RecommendationCard'

// IN JSX - replaced old recommendation cards with:
{recommendedInternships.map((internship) => (
  <RecommendationCard 
    key={internship.id}
    internship={internship}
    matchScore={internship.matchScore}
    onApply={() => handleApply(internship)}
  />
))}
```

---

## 📋 FEATURE CHECKLIST

### Resume Generator ✅
- [ ] User navigates to Profile
- [ ] Clicks "Generate Resume" button
- [ ] Modal opens with resume preview
- [ ] Can download/print as PDF

### AI Recommendations ✅
- [ ] User has skills in profile
- [ ] Navigates to StudentDashboard
- [ ] Sees "Recommended for You" section
- [ ] Each card shows match percentage
- [ ] Can apply directly from card

### Admin Actions ✅
- [ ] Admin approves internship
- [ ] Audit log created automatically
- [ ] Organization gets notification
- [ ] Frontend fallback works if backend unavailable

### Notifications ✅
- [ ] Bell icon in header shows unread count
- [ ] Click to open notification panel
- [ ] Mark individual as read
- [ ] Mark all as read
- [ ] Different icons for different types

### Pagination ✅
- [ ] StudentDashboard shows 10 internships per page
- [ ] AdminDashboard shows 10 pending per page
- [ ] Previous/Next buttons work
- [ ] Page indicator shows position

---

## 🎨 STYLING REFERENCE

### Colors Used
- Primary Blue: `#3b82f6`
- Purple Gradient: `#667eea` to `#764ba2`
- Green (Excellent Match): `#10b981`
- Orange (Fair Match): `#f59e0b`
- Red (Low Match): `#ef4444`
- Light Gray: `#f1f5f9`
- Dark Text: `#1e293b`

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🔧 COMMON TASKS

### Add a new recommendation card style
Edit `RecommendationCard.css`:
```css
.recommendation-card.custom-style {
  /* Add custom styles */
}
```

### Modify resume modal content
Edit `ResumePreviewModal.jsx`, update the `handleDownloadPDF` function's HTML content section.

### Change match score thresholds
Edit `RecommendationCard.jsx`, modify the `getMatchColor` function:
```javascript
const getMatchColor = (score) => {
  if (score >= 85) return 'excellent' // Changed from 80
  // ... rest of logic
}
```

### Add new notification types
Edit `Notifications.jsx`, add to the icon mapping:
```javascript
{notification.type === 'your_type' && '🎉'}
```

---

## 📚 RELATED SERVICES

### Resume Generation
- Service: `client/src/services/ai/resumeGenerator.js`
- Function: `generateResumeSummary(profile)`

### Recommendations
- Service: `client/src/services/ai/recommendationService.js`
- Function: `recommendInternships(internships, profile, limit)`
- Function: `scoreInternshipMatch(internship, profile)`

### Notifications
- Service: `client/src/services/notificationService.js`
- Functions:
  - `createNotification(data)`
  - `subscribeToUserNotifications(userId, callback)`
  - `markNotificationAsRead(notificationId)`
  - `markAllNotificationsAsRead(userId)`
  - `getUnreadCount(userId)`

### Admin Actions
- Service: `client/src/services/adminService.js`
- Functions:
  - `approveInternship(internship, adminUserId)`
  - `rejectInternship(internship, adminUserId)`
- API: `client/src/services/api/adminActionsApi.js`
  - `moderateInternship({ action, internshipId, adminUserId })`

---

## 🐛 TROUBLESHOOTING

### Resume modal not opening
- Check if `resumePreview` state is being set to truthy value
- Verify ResumePreviewModal is imported
- Check browser console for errors

### Recommendations not showing
- Ensure user has skills added to profile
- Check if `recommendInternships` is receiving correct data
- Verify internships have matching skills

### Notifications badge not updating
- Check if user is logged in (auth state)
- Verify subscription is active
- Check Firestore notifications collection has data

### Admin moderation not working
- Check if backend functions are deployed
- Verify adminUserId is being passed
- Check fallback is working (check internship doc in Firestore)

---

Generated: May 19, 2026
For questions or updates, refer to component JSDoc comments.
