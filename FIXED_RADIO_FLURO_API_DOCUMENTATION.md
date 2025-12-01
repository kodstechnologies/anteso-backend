# Fixed Radio Fluro API Documentation

Base URL: `/anteso/admin/service-report/fixed-radio-fluro`

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Accuracy of Operating Potential

### Create/Update Test
**POST** `/accuracy-of-operating-potential/:serviceId`

**URL Parameters:**
- `serviceId` (required): MongoDB ObjectId of the Service

**Request Body:**
```json
{
  "table1": [
    {
      "time": "1.0",
      "sliceThickness": "10mm"
    },
    {
      "time": "2.0",
      "sliceThickness": "5mm"
    }
  ],
  "table2": [
    {
      "setKV": "80",
      "ma10": "78",
      "ma100": "79",
      "ma200": "80",
      "avgKvp": "79.0",
      "remarks": "Within tolerance"
    },
    {
      "setKV": "100",
      "ma10": "98",
      "ma100": "99",
      "ma200": "100",
      "avgKvp": "99.0",
      "remarks": "Within tolerance"
    }
  ],
  "tolerance": {
    "value": "2.0",
    "type": "kvp",
    "sign": "both"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": {
    "testId": "507f1f77bcf86cd799439011",
    "serviceId": "507f191e810c19729de860ea"
  }
}
```

---

### Get Test by Service ID
**GET** `/accuracy-of-operating-potential-by-serviceId/:serviceId`

**URL Parameters:**
- `serviceId` (required): MongoDB ObjectId of the Service

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "serviceId": "507f191e810c19729de860ea",
    "table1": [
      {
        "time": "1.0",
        "sliceThickness": "10mm"
      }
    ],
    "table2": [
      {
        "setKV": "80",
        "ma10": "78",
        "ma100": "79",
        "ma200": "80",
        "avgKvp": "79.0",
        "remarks": "Within tolerance"
      }
    ],
    "tolerance": {
      "value": "2.0",
      "type": "kvp",
      "sign": "both"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Not Found Response (404):**
```json
{
  "success": true,
  "data": null
}
```

---

### Get Test by Test ID
**GET** `/accuracy-of-operating-potential/:testId`

**URL Parameters:**
- `testId` (required): MongoDB ObjectId of the Test

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "serviceId": "507f191e810c19729de860ea",
    "table1": [...],
    "table2": [...],
    "tolerance": {...}
  }
}
```

---

### Update Test
**PUT** `/accuracy-of-operating-potential/:testId`

**URL Parameters:**
- `testId` (required): MongoDB ObjectId of the Test

**Request Body:** (Same as Create)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Updated successfully",
  "data": {
    "testId": "507f1f77bcf86cd799439011"
  }
}
```

---

## 2. Total Filtration

### Create Test
**POST** `/total-filteration/:serviceId`

**Request Body:**
```json
{
  "mAStations": ["10", "50", "100", "200"],
  "measurements": [
    {
      "appliedKvp": "80",
      "measuredValues": ["78", "79", "80"],
      "averageKvp": "79.0",
      "remarks": "Pass"
    },
    {
      "appliedKvp": "100",
      "measuredValues": ["98", "99", "100"],
      "averageKvp": "99.0",
      "remarks": "Pass"
    }
  ],
  "tolerance": {
    "sign": "both",
    "value": "2.0"
  },
  "totalFiltration": {
    "measured": "2.5",
    "required": "2.0"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Total Filtration test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "serviceId": "507f191e810c19729de860ea",
    "mAStations": ["10", "50", "100", "200"],
    "measurements": [...],
    "tolerance": {...},
    "totalFiltration": {...},
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get by Service ID
**GET** `/total-filteration-by-serviceId/:serviceId`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "serviceId": "507f191e810c19729de860ea",
    "mAStations": [...],
    "measurements": [...],
    "tolerance": {...},
    "totalFiltration": {...}
  }
}
```

---

### Get by Test ID
**GET** `/total-filteration/:testId`

---

### Update Test
**PUT** `/total-filteration/:testId`

**Request Body:** (Same as Create)

---

## 3. Output Consistency

### Create Test
**POST** `/output-consistency/:serviceId`

**Request Body:**
```json
{
  "parameters": {
    "mas": "100",
    "sliceThickness": "10mm",
    "time": "1.0"
  },
  "outputRows": [
    {
      "kvp": "80",
      "outputs": ["100", "101", "102", "103", "104"],
      "mean": "102.0",
      "cov": "0.0123"
    },
    {
      "kvp": "100",
      "outputs": ["200", "201", "202", "203", "204"],
      "mean": "202.0",
      "cov": "0.0098"
    }
  ],
  "measurementHeaders": ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
  "tolerance": "2.0",
  "finalRemark": "Pass"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Output Consistency test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "serviceId": "507f191e810c19729de860ea",
    "parameters": {...},
    "outputRows": [...],
    "measurementHeaders": [...],
    "tolerance": "2.0",
    "finalRemark": "Pass"
  }
}
```

---

### Get by Service ID
**GET** `/output-consistency-by-service/:serviceId`

---

### Get by Test ID
**GET** `/output-consistency/:testId`

---

### Update Test
**PUT** `/output-consistency/:testId`

---

## 4. High Contrast Resolution

### Create Test
**POST** `/high-contrast-resolution/:serviceId`

**Request Body:**
```json
{
  "measuredLpPerMm": "1.60",
  "recommendedStandard": "1.50",
  "tolerance": "±10%",
  "remark": "PASS"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "High Contrast Resolution test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "serviceId": "507f191e810c19729de860ea",
    "measuredLpPerMm": "1.60",
    "recommendedStandard": "1.50",
    "tolerance": "±10%",
    "remark": "PASS",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get by Service ID
**GET** `/high-contrast-resolution-by-service/:serviceId`

---

### Get by Test ID
**GET** `/high-contrast-resolution/:testId`

---

### Update Test
**PUT** `/high-contrast-resolution/:testId`

---

## 5. Low Contrast Resolution

### Create Test
**POST** `/low-contrast-resolution/:serviceId`

**Request Body:**
```json
{
  "smallestHoleSize": "2.8",
  "recommendedStandard": "3.0",
  "tolerance": "±5%",
  "remark": "PASS"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Low Contrast Resolution test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "serviceId": "507f191e810c19729de860ea",
    "smallestHoleSize": "2.8",
    "recommendedStandard": "3.0",
    "tolerance": "±5%",
    "remark": "PASS"
  }
}
```

---

### Get by Service ID
**GET** `/low-contrast-resolution-by-service/:serviceId`

---

### Get by Test ID
**GET** `/low-contrast-resolution/:testId`

---

### Update Test
**PUT** `/low-contrast-resolution/:testId`

---

## 6. Exposure Rate

### Create Test
**POST** `/exposure-rate/:serviceId`

**Request Body:**
```json
{
  "rows": [
    {
      "distance": "100",
      "appliedKv": "80",
      "appliedMa": "100",
      "exposure": "2.5",
      "remark": "AEC Mode"
    },
    {
      "distance": "100",
      "appliedKv": "100",
      "appliedMa": "200",
      "exposure": "5.0",
      "remark": "Manual Mode"
    }
  ],
  "nonAecTolerance": "10.0",
  "aecTolerance": "15.0",
  "minFocusDistance": "100"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Exposure Rate test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "serviceId": "507f191e810c19729de860ea",
    "rows": [...],
    "nonAecTolerance": "10.0",
    "aecTolerance": "15.0",
    "minFocusDistance": "100"
  }
}
```

---

### Get by Service ID
**GET** `/exposure-rate-by-service/:serviceId`

---

### Get by Test ID
**GET** `/exposure-rate/:testId`

---

### Update Test
**PUT** `/exposure-rate/:testId`

---

## 7. Congruence

### Create Test
**POST** `/congruence/:serviceId`

**Request Body:**
```json
{
  "techniqueFactors": [
    {
      "fcd": 100,
      "kv": 80,
      "mas": 10
    },
    {
      "fcd": 120,
      "kv": 100,
      "mas": 20
    }
  ],
  "congruenceMeasurements": [
    {
      "dimension": "X",
      "observedShift": 0.5,
      "edgeShift": 0.3,
      "percentFED": 0.5,
      "tolerance": 2.0,
      "remark": "Pass"
    },
    {
      "dimension": "Y",
      "observedShift": 0.4,
      "edgeShift": 0.2,
      "percentFED": 0.4,
      "tolerance": 2.0,
      "remark": "Pass"
    }
  ],
  "finalResult": "PASS"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Congruence test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "serviceId": "507f191e810c19729de860ea",
    "techniqueFactors": [...],
    "congruenceMeasurements": [...],
    "finalResult": "PASS"
  }
}
```

---

### Get by Service ID
**GET** `/congruence-by-service/:serviceId`

---

### Get by Test ID
**GET** `/congruence/:testId`

---

### Update Test
**PUT** `/congruence/:testId`

---

## 8. Central Beam Alignment

### Create Test
**POST** `/central-beam-alignment/:serviceId`

**Request Body:**
```json
{
  "techniqueFactors": {
    "fcd": 100,
    "kv": 80,
    "mas": 10
  },
  "observedTilt": {
    "operator": "<",
    "value": 1.5,
    "remark": "Pass"
  },
  "tolerance": {
    "operator": "<=",
    "value": 2.0
  },
  "finalResult": "PASS"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Central Beam Alignment test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "serviceId": "507f191e810c19729de860ea",
    "techniqueFactors": {...},
    "observedTilt": {...},
    "tolerance": {...},
    "finalResult": "PASS"
  }
}
```

---

### Get by Service ID
**GET** `/central-beam-alignment-by-service/:serviceId`

---

### Get by Test ID
**GET** `/central-beam-alignment/:testId`

---

### Update Test
**PUT** `/central-beam-alignment/:testId`

---

## 9. Effective Focal Spot

### Create Test
**POST** `/effective-focal-spot/:serviceId`

**Request Body:**
```json
{
  "fcd": 100,
  "toleranceCriteria": {
    "small": {
      "multiplier": 0.5,
      "upperLimit": 0.8
    },
    "medium": {
      "multiplier": 0.4,
      "lowerLimit": 0.8,
      "upperLimit": 1.5
    },
    "large": {
      "multiplier": 0.3,
      "lowerLimit": 1.5
    }
  },
  "focalSpots": [
    {
      "focusType": "Small",
      "statedWidth": 0.6,
      "statedHeight": 0.6,
      "measuredWidth": 0.55,
      "measuredHeight": 0.58,
      "remark": "Pass"
    },
    {
      "focusType": "Large",
      "statedWidth": 1.2,
      "statedHeight": 1.2,
      "measuredWidth": 1.15,
      "measuredHeight": 1.18,
      "remark": "Pass"
    }
  ],
  "finalResult": "PASS"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Effective Focal Spot test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439019",
    "serviceId": "507f191e810c19729de860ea",
    "fcd": 100,
    "toleranceCriteria": {...},
    "focalSpots": [...],
    "finalResult": "PASS"
  }
}
```

---

### Get by Service ID
**GET** `/effective-focal-spot-by-service/:serviceId`

---

### Get by Test ID
**GET** `/effective-focal-spot/:testId`

---

### Update Test
**PUT** `/effective-focal-spot/:testId`

---

## 10. Tube Housing Leakage

### Create Test
**POST** `/tube-housing/:serviceId`

**Request Body:**
```json
{
  "fcd": "100",
  "kv": "80",
  "ma": "100",
  "time": "1.0",
  "workload": "1000 mAs",
  "leakageMeasurements": [
    {
      "location": "Tube",
      "left": "0.5",
      "right": "0.4",
      "front": "0.3",
      "back": "0.4",
      "top": "0.2"
    },
    {
      "location": "Collimator",
      "left": "0.3",
      "right": "0.2",
      "front": "0.1",
      "back": "0.2",
      "top": "0.1"
    }
  ],
  "toleranceValue": "1.0",
  "toleranceOperator": "less than or equal to",
  "toleranceTime": "1 hour",
  "remark": "Pass"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Tube Housing Leakage test created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "serviceId": "507f191e810c19729de860ea",
    "fcd": "100",
    "kv": "80",
    "ma": "100",
    "time": "1.0",
    "workload": "1000 mAs",
    "leakageMeasurements": [...],
    "toleranceValue": "1.0",
    "toleranceOperator": "less than or equal to",
    "toleranceTime": "1 hour",
    "remark": "Pass"
  }
}
```

---

### Get by Service ID
**GET** `/tube-housing-by-service/:serviceId`

---

### Get by Test ID
**GET** `/tube-housing/:testId`

---

### Update Test
**PUT** `/tube-housing/:testId`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Valid serviceId is required in URL"
}
```

### 403 Forbidden (Wrong Machine Type)
```json
{
  "success": false,
  "message": "This test is only allowed for Fixed Radio Fluro. Current machine: CT Scan"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Service not found"
}
```
or
```json
{
  "success": false,
  "message": "Test record not found"
}
```

### 409 Conflict (Already Exists)
```json
{
  "success": false,
  "message": "Total Filtration data already exists for this service"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to save test",
  "error": "Error details here"
}
```

---

## Common Notes

1. **Authentication**: All endpoints require JWT token in Authorization header
2. **serviceId**: Must be a valid MongoDB ObjectId
3. **Machine Type Validation**: Service must have `machineType === "Fixed Radio Fluro"`
4. **Upsert Behavior**: Create endpoint will update if test already exists for the serviceId
5. **Dates**: All timestamps are in ISO 8601 format (UTC)

---

## Example cURL Commands

### Create Accuracy of Operating Potential Test
```bash
curl -X POST \
  http://localhost:5000/anteso/admin/service-report/fixed-radio-fluro/accuracy-of-operating-potential/507f191e810c19729de860ea \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "table1": [
      {
        "time": "1.0",
        "sliceThickness": "10mm"
      }
    ],
    "table2": [
      {
        "setKV": "80",
        "ma10": "78",
        "ma100": "79",
        "ma200": "80",
        "avgKvp": "79.0",
        "remarks": "Within tolerance"
      }
    ],
    "tolerance": {
      "value": "2.0",
      "type": "kvp",
      "sign": "both"
    }
  }'
```

### Get Test by Service ID
```bash
curl -X GET \
  http://localhost:5000/anteso/admin/service-report/fixed-radio-fluro/accuracy-of-operating-potential-by-serviceId/507f191e810c19729de860ea \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Update Test
```bash
curl -X PUT \
  http://localhost:5000/anteso/admin/service-report/fixed-radio-fluro/accuracy-of-operating-potential/507f1f77bcf86cd799439011 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "table1": [...],
    "table2": [...],
    "tolerance": {...}
  }'
```


