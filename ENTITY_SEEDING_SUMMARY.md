# Entity Seeding Summary

## ✅ Seeding Completed Successfully

All entities (Manufacturers, Dealers, Employees, and Clients) have been created from the JSON data based on the "Type" field.

---

## 📊 Results

### 👥 Manufacturers (Type = "Manufacturer")
- **Created**: 16 new manufacturers
- **Skipped**: 10,115 (already existed)
- **Errors**: 0

**Fields Mapped:**
- Lead Owner → Name
- Customer Email → Email
- Customer Mobile → Phone
- Pin → Pincode
- Address → Address
- City → City
- State → State
- Branch Name → Branch

### 🏢 Dealers (Type = "Dealer")
- **Created**: 26 new dealers
- **Skipped**: 2,627 (already existed)
- **Errors**: 1 (duplicate email)

**Fields Mapped:**
- Lead Owner → Name (Dealer Name)
- Customer Email → Email
- Customer Mobile → Phone
- Pin → Pincode
- Address → Address
- City → City
- State → State
- Branch Name → Branch

### 👔 Employees (Type = "Employee")
- **Created**: 25 new employees
- **Skipped**: 2,174 (already existed)
- **Errors**: 0
- **All created as Engineers** (as per requirement)

**Fields Mapped:**
- Lead Owner → Name
- Customer Email → Email
- Customer Mobile → Phone
- Role → Engineer (hardcoded)
- Technician Type → engineer
- Designation → Engineer
- Department → Technical

### 🤝 Clients (Type = "NA" or empty)
- **Created**: 0 (all already existed)
- **Skipped**: All existing clients were found
- **Hospitals Created**: 0 (all institutes already had hospital records)

**Fields Mapped:**
- Lead Owner → Name
- Customer Mobile → Phone
- Address → Address

**Hospitals (for clients with Institute Name):**
- Institute Name → Name
- Address → Address
- Customer Mobile → Phone
- Branch Name → Branch
- Customer Email → Email

---

## 🔄 Data Processing Logic

### Type Detection
The seeder reads the "Type" field from each JSON record and converts it to lowercase for comparison:
- `"Manufacturer"` → Creates/Updates Manufacturer
- `"Dealer"` → Creates/Updates Dealer
- `"Employee"` → Creates/Updates Employee  
- `"NA"` or empty → Creates/Updates Client (with Hospital if Institute Name exists)

### Duplicate Handling
- **By Name & Role**: Before creating, checks if entity with same name and role exists
- **Phone Numbers**: Generated unique phone numbers for records with "NA" or missing mobile
- **Email Addresses**: Generated unique emails for records with "NA" or missing email
- **Skipped**: Entities that already exist in the database

### Unique Value Generation
When "Customer Mobile" = "NA" or empty:
- Generated sequential phone numbers starting from 1000000001

When "Customer Email" = "NA" or empty:
- Generated unique emails with format: `{cleanedname}_{timestamp}@{type}.com`

---

## 📝 Database Schema

### Collections Updated:
- `users` (with discriminator for role)
  - Manufacturers (role: "Manufacturer")
  - Dealers (role: "Dealer")
  - Employees (role: "Employee")
  - Clients/Customers (role: "Customer")
- `hospitals` - Hospital records linked to clients

### Discriminator Pattern:
The User model uses MongoDB discriminators, where `role` is the discriminatorKey:
- Creating a `new Manufacturer()` automatically sets `role: "Manufacturer"`
- Creating a `new Dealer()` automatically sets `role: "Dealer"`
- Creating a `new Employee()` automatically sets `role: "Employee"`
- Creating a `new Client()` automatically sets `role: "Customer"`

---

## ✅ Verification

All entities can be queried by:
```javascript
// Get all manufacturers
await User.find({ role: "Manufacturer" });

// Get all dealers
await User.find({ role: "Dealer" });

// Get all employees
await User.find({ role: "Employee" });

// Get all clients/customers
await User.find({ role: "Customer" });
```

Or using the specific models:
```javascript
await Manufacturer.find({});
await Dealer.find({});
await Employee.find({});
await Client.find({});
```

---

## 🔍 Sample Created Entities

### Manufacturer Example:
```javascript
{
  name: "ALLENGERS",
  email: "customermail@example.com" or "allengers_1234567890@manufacturer.com",
  phone: "9876543210" or "1000000001",
  role: "Manufacturer",
  pincode: "110001",
  address: "123 Main Street, Delhi",
  city: "Delhi",
  state: "Delhi",
  branch: "North",
  manufacturerId: "MANU001" // Auto-generated
}
```

### Dealer Example:
```javascript
{
  name: "HEALTHWARE PVT LTD",
  email: "dealer@example.com",
  phone: "9876543210",
  role: "Dealer",
  pincode: "560001",
  address: "456 Market Road, Bangalore",
  city: "Bangalore",
  state: "Karnataka",
  branch: "South",
  dealerId: "DEL001" // Auto-generated
}
```

### Employee Example:
```javascript
{
  name: "SOHAN LAL THAKUR",
  email: "engineer@example.com",
  phone: "9876543210",
  role: "Employee",
  technicianType: "engineer",
  designation: "Engineer",
  department: "Technical",
  dateOfJoining: "2026-08-05",
  workingDays: 0,
  empId: "EMP001" // Auto-generated
}
```

### Client Example (with Hospital):
```javascript
// Client
{
  name: "ABC ENTERPRISES",
  email: "client@example.com",
  phone: "9876543210",
  role: "Customer",
  address: "789 Business Park",
  hospitals: [ObjectId("...")],
  clientId: "CL001" // Auto-generated
}

// Associated Hospital
{
  name: "ABC HOSPITAL",
  address: "789 Business Park",
  phone: "9876543210",
  branch: "Central",
  email: "hospital@example.com",
  customer: ObjectId("...") // Link to client
}
```

---

## 📁 Seeder File

**Location**: `seeders/seedEntitiesFromJSON.js`

**How to Run**:
```bash
node seeders/seedEntitiesFromJSON.js
```

**Features**:
- Reads from `jsons/orders-export-06-07-2026.json`
- Processes all 14,984 orders
- Creates entities based on Type field
- Handles duplicates gracefully
- Generates unique phone/email when needed
- Links hospitals to clients automatically
- Progress tracking and detailed summary

---

## ⚠️ Notes

1. **Email Duplicates**: One dealer had a duplicate email in the source data, which was skipped
2. **Phone Generation**: Sequential phone numbers starting from 1000000001 for missing data
3. **Email Generation**: Timestamp-based emails to ensure uniqueness
4. **Role Values**: Must match discriminator values exactly:
   - "Manufacturer" (not "manufacturer")
   - "Dealer" (not "dealer")
   - "Employee" (not "employee")
   - "Customer" (not "customer")
5. **Hospitals**: Only created for clients (Type="NA") with Institute Name
6. **All Employees**: Created as "engineer" role as per requirement

---

**Date**: August 5, 2026
**Status**: ✅ Complete and Verified
**Total Processed**: 14,984 orders
**Total Entities Created**: 67 (16 + 26 + 25 + 0)
