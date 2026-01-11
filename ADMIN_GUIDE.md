# Admin Management System - Complete Guide

## Overview
Your Disaster Response Platform now includes a comprehensive **Admin Dashboard** with full user and alert management capabilities, including user verification (like LinkedIn verified), blocking, and content moderation.

## 🎯 Key Features

### 1. **User Verification System** ✓
Similar to LinkedIn verified badges, admins can verify users/organizations to show they are legitimate.

- **Mark as Verified**: Verified users get a ✓ Verified badge
- **Prevents Fraud**: Only verified organizations can be trusted when submitting alerts
- **Visual Indicators**: Unverified users show different badge colors

### 2. **User Management**
- ✅ **Verify Users**: Grant verified status to legitimate organizations
- 🚫 **Block Users**: Prevent users from logging in or submitting alerts
- 🗑️ **Delete Users**: Remove accounts and all their associated alerts

### 3. **Alert Verification & Moderation**
- ✅ **Verify Alerts**: Mark alerts as legitimate and official
- 🗑️ **Delete Alerts**: Remove false or spam alerts
- 📊 **Track Unverified Alerts**: Dashboard shows count of pending review

### 4. **Admin Dashboard Statistics**
Real-time statistics showing:
- Total Alerts Count
- Unverified Alerts (pending review)
- Total User Count
- Verified User Count
- Alerts/Users by Type and Severity

---

## 👨‍💼 Admin Credentials

**Default Admin Account:**
- Email: `admin@disaster-response.com`
- Password: `Admin@DisasterResponse123`

⚠️ **IMPORTANT**: Change this password after first login!

---

## 🔧 How to Use the Admin Dashboard

### Accessing Admin Features:
1. Login to the application with admin credentials
2. Click on the "Dashboard" tab
3. The Admin Dashboard will appear automatically if you have admin privileges

### Managing Alerts:

**Alert Verification Process:**
1. Go to "Alert Management" tab
2. See all alerts with their status (Verified/Pending)
3. Click "✓ Verify" to approve legitimate alerts
4. Click "Delete" to remove false/spam alerts

**Alert Status Indicators:**
- 🟢 **Verified**: Approved by admin, shown to public
- 🟡 **Pending**: Waiting for admin review
- 👤 **User Status**: Shows if the submitter is verified/unverified

### Managing Users:

**User Verification Process:**
1. Go to "User Management" tab
2. See all users with their roles (admin/user) and status
3. Click "✓ Verify" to mark users/organizations as verified
4. Click "Block" to prevent user login
5. Click "Delete" to remove account permanently

**User Status Indicators:**
- 🟢 **Active**: User can login and submit alerts
- 🟡 **Unverified**: User exists but not verified
- 🔴 **Blocked**: User cannot login (account frozen)
- ⭐ **Verified**: Organization is trusted

---

## 📋 Admin API Endpoints

All endpoints require Bearer token authentication with admin role.

### User Management Endpoints:

```bash
# Verify a user
POST /api/admin/verify-user
{
  "userId": "user-uuid",
  "verified": true
}

# Block/Unblock a user
POST /api/admin/block-user
{
  "userId": "user-uuid",
  "blocked": true,
  "reason": "Spam activity"
}

# Delete a user and their alerts
POST /api/admin/delete-user
{
  "userId": "user-uuid"
}

# List all users
GET /api/admin/users?limit=100&offset=0
```

### Alert Management Endpoints:

```bash
# Verify an alert
POST /api/admin/verify-alert
{
  "alertId": "alert-uuid",
  "verified": true
}

# Delete an alert
POST /api/admin/delete-alert
{
  "alertId": "alert-uuid",
  "reason": "False alarm"
}
```

---

## 🔐 Security Features

### Role-Based Access Control:
- **Admin Role**: Full access to all management features
- **User Role**: Can only view and submit alerts
- Admins cannot delete their own accounts

### Verification Workflow:
```
New User Registration
    ↓
User Submits Alerts (Unverified Status)
    ↓
Admin Reviews User & Alerts
    ↓
Admin Verifies User (Optional)
    ↓
Alerts Show "Verified Organization" Badge
    ↓
Public Trusts Alert More
```

---

## 📊 Dashboard Widgets Explained

### Statistics Cards (Top Row):
| Card | Shows | Meaning |
|------|-------|---------|
| Total Alerts | 45 | Total disaster alerts in system |
| Unverified Alerts | 8 | Alerts pending admin review |
| Total Users | 23 | Registered user accounts |
| Verified Users | 5 | Users marked as verified |

### Alert Management Table:
- **Location**: Where the disaster occurred
- **Type**: Flood, Fire, Earthquake, etc.
- **Severity**: Critical, High, Medium, Low
- **Submitted By**: Email of submitter
- **User Status**: Is submitter verified? (colored badge)
- **Alert Status**: Is alert approved? (green=verified, yellow=pending)
- **Actions**: Verify or Delete buttons

### User Management Table:
- **Email**: User's email address
- **Name**: Display name
- **Role**: admin or user
- **Account Status**: Active or Blocked
- **Verification**: ✓ Verified or Unverified badge
- **Actions**: Verify, Block, Delete buttons

---

## ⚙️ Configuration

### To Add More Admins:
1. Create a regular user account (via registration)
2. Manually update the user's role in the database:
   ```
   {
     "role": "admin",
     "verified": true
   }
   ```

### To Change Admin Password:
1. Login as admin
2. Use your auth system to change password
3. The system uses bcrypt for secure hashing

---

## 🎯 Use Cases

### Scenario 1: Verifying an Organization
- Red Cross registers an account
- Submits 10 alerts about flood emergency
- Admin clicks "✓ Verify" on the user
- All their alerts now show "Verified Organization" badge
- Public trusts these alerts more

### Scenario 2: Removing False Alerts
- Someone submits a false bomb threat alert
- Admin sees it's unverified user
- Admin clicks "Delete" on the alert
- Alert is removed from public view

### Scenario 3: Blocking Spammer
- User submits 100 fake alerts repeatedly
- Admin clicks "Block" on the user
- User can no longer login
- All their alerts remain but are marked as unverified

---

## 📱 Access from Different Devices

The Admin Dashboard is available:
- ✅ **Web**: On desktop at https://blue-sand-0ebf47300.1.azurestaticapps.net
- ✅ **Mobile**: Responsive design works on tablets and phones
- ✅ **Azure**: All data synced in real-time with Azure backend

---

## 🆘 Troubleshooting

### "Admin access required" error?
- Make sure you're logged in as an admin user
- Check your role in the user management table
- You must have `"role": "admin"` in your account

### Verify button not working?
- Check browser console (F12) for errors
- Ensure your admin token is valid
- Try refreshing the page

### Can't access Admin Dashboard?
- Log out and log back in
- The role is checked on every load
- Make sure your account role is "admin"

---

## 🔐 Best Practices

1. **Change Default Admin Password** - Do this immediately!
2. **Create Multiple Admins** - Don't rely on one account
3. **Review Alerts Weekly** - Stay on top of unverified content
4. **Verify Trusted Sources** - Government, NGOs, Emergency Services
5. **Block Spammers Quickly** - Prevent system abuse
6. **Document Decisions** - Note why you verified/blocked users

---

## 📞 Support

For issues with the admin system:
1. Check the troubleshooting section above
2. Review the Azure Function App logs
3. Verify environment variables are set correctly
4. Check application-insights for errors

---

**Dashboard URL**: https://blue-sand-0ebf47300.1.azurestaticapps.net
**Admin API Base**: https://disaster-response-func-prod-4ox6yuz3uoba6.azurewebsites.net/api
