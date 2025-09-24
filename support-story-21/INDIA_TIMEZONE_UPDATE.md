# India Timezone Update

## Overview
This update changes all date/time formatting in the application from Dubai timezone (Asia/Dubai) to India timezone (Asia/Kolkata) to ensure all pages and sections use the current date and time for India.

## Changes Made

### Frontend Changes

1. **TicketDetail.tsx**
   - Updated `formatToDubaiTime` function to use `Asia/Kolkata` timezone
   - Affects ticket creation and closure timestamps

2. **Tickets.tsx**
   - Updated `formatToDubaiTime` function to use `Asia/Kolkata` timezone
   - Affects ticket list timestamps

3. **Sales.tsx**
   - Updated `formatToDubaiTime` function to use `Asia/Kolkata` timezone
   - Affects sales list timestamps

4. **SaleDetail.tsx**
   - Updated `formatToDubaiTime` function to use `Asia/Kolkata` timezone
   - Updated `formatDate` function to use `Asia/Kolkata` timezone
   - Affects sale detail timestamps

5. **NewTicket.tsx**
   - Updated date formatting in resolution history to use `Asia/Kolkata` timezone

6. **Dashboard.tsx**
   - Updated date formatting in recent tickets to use `Asia/Kolkata` timezone

7. **Settings.tsx**
   - Updated timezone options to default to "Asia/Kolkata" (India)
   - Reordered options to show India first

### Backend Changes

1. **server/README.md**
   - Updated documentation to reflect India timezone handling instead of Dubai

## Technical Details

All date formatting functions were updated to use the Intl.DateTimeFormat API with the `Asia/Kolkata` timezone setting:

```javascript
new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}).format(date);
```

## Benefits

1. **Consistency**: All pages and sections now display dates and times in India timezone
2. **Accuracy**: Users in India will see accurate local timestamps
3. **User Experience**: Improved experience for Indian users who make up the primary user base
4. **Compliance**: Ensures all timestamps align with the business's operational timezone

## Testing

The changes have been tested to ensure:
- All date/time displays show India timezone (UTC+5:30)
- Formatting remains consistent across all pages
- No breaking changes to existing functionality
- Settings page correctly defaults to India timezone

## Files Modified

- src/pages/TicketDetail.tsx
- src/pages/Tickets.tsx
- src/pages/Sales.tsx
- src/pages/SaleDetail.tsx
- src/pages/NewTicket.tsx
- src/pages/Dashboard.tsx
- src/pages/Settings.tsx
- server/README.md

## Notes

The function names still use "Dubai" in some cases for backward compatibility, but they now actually format dates for the India timezone. In a future update, these function names could be renamed to be more accurate.