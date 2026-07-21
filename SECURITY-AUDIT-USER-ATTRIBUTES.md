# Security Audit: User Account Attribute Modification

## Executive Summary
**CRITICAL ISSUE**: There are **NO** API endpoints to modify user account attributes (`role`, `isPremium`, `onboardingStep`) after account creation. These fields can currently only be modified via direct database access.

---

## 1. Endpoints for User Attribute Changes

### Admin Status Management
**File**: [src/app/api/admin/members/[memberId]/status/route.ts](src/app/api/admin/members/[memberId]/status/route.ts)
- **Method**: `PATCH /api/admin/members/{memberId}/status`
- **Access**: ADMIN or SUPREME_ADMIN only
- **What it changes**: `status` field (active ↔ suspended)
- **What it DOES NOT change**: role, isPremium, onboardingStep
- **Code snippet**:
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  // ... auth check ...
  
  // Only allows 'active' or 'suspended'
  await prisma.user.update({
    where: { id: target.id },
    data: { status: body.status }, // Only status field
  })
}
```

### Member Profile Update
**File**: [src/app/api/member/profile/route.ts](src/app/api/member/profile/route.ts)
- **Method**: `PATCH /api/member/profile`
- **Access**: Authenticated user (self-only)
- **What it changes**: Profile information (city, gender, bio, photos, videos, etc.)
- **What it DOES NOT change**: role, isPremium, onboardingStep
- **Code snippet**:
```typescript
export async function PATCH(request: NextRequest) {
  // ... auth check ...
  
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        displayName: nextDisplayName, // Profile data only
        firstName: nextDisplayName,
        // NO role, isPremium, onboardingStep updates
      },
    }),
    // ... profile upsert ...
  ])
}
```

---

## 2. Where These Fields Are Set (Initial Creation Only)

### Role Field

#### Default MEMBER Role - Registration
**File**: [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts) (Line ~130)
```typescript
const createdUser = await prisma.$transaction(async (tx) => {
  const accountName = await generateNextAccountName(tx)
  return tx.user.create({
    data: {
      email,
      username,
      passwordHash,
      onboardingStep: 'passcode',
      profile: { create: { age, dateOfBirth } },
      // role: not specified → defaults to 'MEMBER'
    },
  })
})
```

#### BURNER Role - Secret Code Login
**File**: [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts) (Lines 201-220)
```typescript
if (passcode === '9999') {
  // Create temporary burner account
  const burner = await prisma.user.create({
    data: {
      username: `burner_${Date.now()}`,
      displayName: 'Burner',
      accountName: await generateNextAccountName(tx),
      personalCode,
      passwordHash: bcrypt.hashSync(''),
      role: 'BURNER', // ← Only place where BURNER is set
      onboardingStep: 'completed',
      loginPin: '0000',
    },
  })
}
```

#### Onboarding Full Profile
**File**: [src/app/api/auth/onboard/route.ts](src/app/api/auth/onboard/route.ts) (Line ~270)
```typescript
const user = await prisma.$transaction(async (tx) => {
  const accountName = await generateNextAccountName(tx)
  return tx.user.create({
    data: {
      email: email || null,
      username,
      passwordHash,
      onboardingStep: 'completed',
      status: 'active',
      // role: not specified → defaults to 'MEMBER'
    },
  })
})
```

### isPremium Field

**Current State**: Always set to `false` by default in Prisma schema
**File**: [prisma/schema.prisma](prisma/schema.prisma)
```prisma
model User {
  id             String   @id @default(cuid())
  role           UserRole @default(MEMBER)
  isPremium      Boolean  @default(false)  // ← Always false initially
  onboardingStep String   @default("passcode")
  status         String   @default("active")
}
```

**Usage** (read-only in APIs):
- [src/app/api/member/profile/route.ts](src/app/api/member/profile/route.ts#L43-L44): Returned in profile response
- [src/app/api/member/media/route.ts](src/app/api/member/media/route.ts#L30-L31): Checked for media upload limits
- [src/app/lib/member-media-policy.ts](src/lib/member-media-policy.ts#L17): Used for determining upload restrictions

### onboardingStep Field

Progression through auth flows:

1. **Register** → `'passcode'`
   [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts#L129)

2. **Verify Email** → `'completed'`
   [src/app/api/auth/verify-email/route.ts](src/app/api/auth/verify-email/route.ts#L48)

3. **Onboard** → `'completed'`
   [src/app/api/auth/onboard/route.ts](src/app/api/auth/onboard/route.ts#L253)

4. **Login Burner (9999)** → `'completed'`
   [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts#L221)

---

## 3. User Role Definition (Enum)

**File**: [prisma/schema.prisma](prisma/schema.prisma)
```prisma
enum UserRole {
  SUPREME_ADMIN   // 1: Supreme Admin, total control
  ADMIN          // 2: Admin, normal admin
  MODEL_VERIFIED // 3: Model Verified, ID submitted
  MEMBER         // 4: Standard, email-verified
  BURNER         // 5: Burner/default/public
}
```

**Helper Functions**:
- [src/lib/account-category.ts](src/lib/account-category.ts#L12): `getAccountCategoryFromRole(role)`
- [src/lib/staff-access.ts](src/lib/staff-access.ts#L5): `isStaffRole(role)` - checks ADMIN or SUPREME_ADMIN

---

## 4. Admin Panel UI

**File**: [src/app/admin/page.tsx](src/app/admin/page.tsx)

Current capabilities:
- View member list with role, status, email verification
- Toggle member status (active ↔ suspended)
- View audit logs

**NOT available**:
- Change user role
- Change isPremium status
- Promote to MODEL_VERIFIED, ADMIN, or SUPREME_ADMIN
- Change onboardingStep

**Component**: [src/app/admin/_components/member-control-table.tsx](src/app/admin/_components/member-control-table.tsx)
```typescript
async function toggleStatus(member: AdminMemberRow) {
  // Only status toggle is implemented
  const nextStatus = member.status === 'active' ? 'suspended' : 'active'
  await fetch(`/api/admin/members/${member.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: nextStatus }),
  })
}
```

---

## 5. Libraries & Helper Functions

### Member Media Policy
**File**: [src/lib/member-media-policy.ts](src/lib/member-media-policy.ts)

Uses role and isPremium to determine upload limits:
```typescript
export function getMemberMediaPolicy({ role, isPremium }: { role: UserRole; isPremium: boolean }): MediaPolicy {
  if (isPremium || role === 'ADMIN' || role === 'SUPREME_ADMIN') {
    return UNLIMITED_POLICY
  }
  if (role === 'BURNER') {
    return BURNER_POLICY
  }
  return STANDARD_POLICY
}
```

### API Client Functions
**File**: [src/lib/api.ts](src/lib/api.ts)

**NO admin functions** exist for:
- Changing user role
- Setting isPremium
- Updating onboardingStep

Only user-facing functions exist:
- `updateMemberProfile()` - profile data only
- `updateMemberSettings()` - settings only
- `disableMyAccount()` - account action only

---

## 6. Security Implications

### ⚠️ VULNERABILITIES

1. **No Role Elevation Endpoint**
   - Cannot promote MEMBER → MODEL_VERIFIED or ADMIN via API
   - Only possible via direct database manipulation
   - Admin UI has no role change controls

2. **No Premium Upgrade Endpoint**
   - Cannot upgrade user to isPremium via API
   - Cannot be monetized through standard procedures
   - Only possible via direct database change

3. **No OnboardingStep Reset Endpoint**
   - Cannot move users between onboarding states via API
   - Cannot be used for account recovery or status updates
   - Only possible via direct database change

4. **Database Direct Access Required**
   - Any role changes, premium upgrades, or onboarding resets require direct DB access
   - No audit trail for these changes (unless done through ADMIN_AUDIT_LOG)
   - Bypasses business logic and validation

---

## 7. Recommended Actions

### Immediate (Security)
1. Create `/api/admin/members/[memberId]/role` endpoint for role changes
2. Create `/api/admin/members/[memberId]/premium` endpoint for isPremium changes
3. Create `/api/admin/members/[memberId]/onboarding` endpoint for onboarding step changes
4. Implement proper authorization checks (SUPREME_ADMIN only for sensitive changes)
5. Log all changes to `AdminAuditLog`

### Medium Term (Features)
1. Add role/premium/onboarding controls to admin UI
2. Implement approval workflow for role promotions
3. Create payment integration for premium upgrades
4. Add bulk operations for admin tasks

### Long Term (Architecture)
1. Consider role-based access control (RBAC) system
2. Implement changelog/versioning for user attributes
3. Add notifications when user role/premium status changes
4. Create user-facing settings page for account info

---

## 8. Testing Checklist

- [ ] Verify no unauthorized API to change roles
- [ ] Verify no unauthorized API to set isPremium
- [ ] Verify database audit trail for any direct DB changes
- [ ] Test that admin endpoints (when created) enforce authorization
- [ ] Test that role changes trigger proper audit logs

---

## Files Requiring Changes

When implementing role/isPremium/onboarding management:

1. Create new admin endpoints:
   - `/src/app/api/admin/members/[memberId]/role/route.ts`
   - `/src/app/api/admin/members/[memberId]/premium/route.ts`
   - `/src/app/api/admin/members/[memberId]/onboarding/route.ts`

2. Update admin UI:
   - [src/app/admin/_components/member-control-table.tsx](src/app/admin/_components/member-control-table.tsx)
   - [src/app/admin/page.tsx](src/app/admin/page.tsx)

3. Update API client:
   - [src/lib/api.ts](src/lib/api.ts)

4. Update types if needed:
   - [src/lib/types.ts](src/lib/types.ts)
