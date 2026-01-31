# RetainStream Backend - API Reference

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Endpoints

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "alex.chen@netflix.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "alex.chen@netflix.com",
      "name": "Alex Chen",
      "role": "analyst"
    }
  }
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "New User"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### Dashboard

#### Get Dashboard Metrics
```http
GET /dashboard/metrics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "churnRate": {
      "current": 4.2,
      "previous": 3.8,
      "change": "+0.4%"
    },
    "predictedChurners": {
      "count": 1240,
      "confidence": "94%",
      "change": "-120"
    },
    "modelAuc": {
      "score": 0.87,
      "status": "Stable",
      "version": "2.4.1"
    }
  }
}
```

#### Get Churn Distribution
```http
GET /dashboard/distribution
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "bucket": 0.0, "count": 2450 },
    { "bucket": 0.1, "count": 3580 },
    { "bucket": 0.2, "count": 4120 },
    { "bucket": 0.4, "count": 2980 },
    { "bucket": 0.6, "count": 2450 },
    { "bucket": 0.8, "count": 1240 },
    { "bucket": 0.9, "count": 980 },
    { "bucket": 1.0, "count": 1450 }
  ]
}
```

#### Get Top Churn Factors
```http
GET /dashboard/features
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "Watch Time", "value": 0.42 },
    { "name": "Sub Age", "value": 0.31 },
    { "name": "Devices", "value": 0.28 },
    { "name": "Last Login", "value": 0.19 },
    { "name": "Pay Fail", "value": 0.14 }
  ]
}
```

#### Run Prediction
```http
POST /dashboard/predict
Authorization: Bearer {token}
Content-Type: application/json

{
  "sample_size": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prediction run completed",
  "data": {
    "predictions_generated": 100,
    "average_probability": 0.45,
    "timestamp": "2024-01-31T10:30:00Z"
  }
}
```

---

### Customers

#### Get High-Risk Customers
```http
GET /customers/high-risk?page=1&limit=10
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "user_id": "usr_942183",
        "plan": "Premium 4K",
        "churn_probability": 0.94,
        "last_activity": "2 days ago",
        "tenure_months": 14,
        "risk_level": "High"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1240,
      "pages": 124
    }
  }
}
```

#### Get Customer Details
```http
GET /customers/{customerId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_942183",
    "email": "user@example.com",
    "plan": "Premium 4K",
    "watch_time_hours": 450,
    "subscription_age_months": 14,
    "device_count": 3,
    "last_login_days": 2,
    "payment_failures": 0,
    "tenure_months": 14,
    "churn_probability": 0.94,
    "prediction_date": "2024-01-31T10:00:00Z"
  }
}
```

#### Customer Segmentation
```http
POST /customers/segment
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "segments": [
      { "segment": "High Risk", "count": 1240 },
      { "segment": "Medium Risk", "count": 3580 },
      { "segment": "Low Risk", "count": 45180 }
    ]
  }
}
```

---

### Predictions

#### Get Prediction Results
```http
GET /predictions/results
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "customer_id": "usr_1000000",
        "churn_probability": 0.85,
        "confidence": 0.92,
        "prediction_date": "2024-01-31T10:00:00Z"
      }
    ],
    "total": 100,
    "timestamp": "2024-01-31T10:30:00Z"
  }
}
```

#### Generate Predictions
```http
POST /predictions/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "sample_size": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions_generated": 100,
    "average_probability": 0.45,
    "timestamp": "2024-01-31T10:30:00Z"
  }
}
```

#### Get Model Performance
```http
GET /predictions/performance
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "auc": 0.87,
    "precision": 0.84,
    "recall": 0.89,
    "f1_score": 0.86,
    "training_samples": 120000,
    "model_version": "2.4.1",
    "last_trained": "2024-01-30T15:00:00Z"
  }
}
```

---

### Model

#### Get Model Status
```http
GET /model/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "2.4.1",
    "algorithm": "XGBoost",
    "status": "Active",
    "auc_score": 0.87,
    "training_samples": 120000,
    "features": 45,
    "last_updated": "2024-01-30T15:00:00Z",
    "performance": {
      "improved": true,
      "previous_auc": 0.72,
      "current_auc": 0.87,
      "improvement": "+0.15 (+20.8%)"
    }
  }
}
```

#### Train Model
```http
POST /model/train
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Model training completed",
    "metrics": {
      "auc": 0.87,
      "precision": 0.84,
      "recall": 0.89,
      "f1_score": 0.86,
      "training_samples": 120000
    }
  }
}
```

#### Get Feature Importance
```http
GET /model/features
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "features": [
      { "name": "Watch Time", "importance": 0.42 },
      { "name": "Subscription Age", "importance": 0.31 },
      { "name": "Device Count", "importance": 0.28 },
      { "name": "Last Login Days", "importance": 0.19 },
      { "name": "Payment Failures", "importance": 0.14 }
    ]
  }
}
```

---

### Health

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-31T10:30:00Z",
  "service": "RetainStream API",
  "version": "1.0.0"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": {}
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Limit:** 100 requests per 15 minutes per IP
- **Header:** `X-RateLimit-Remaining`

---

## CORS

The API allows cross-origin requests from configured origins:
```
http://localhost:3000
http://localhost:5000
```

---

## Webhook Events

Webhook events are triggered for important actions:

- `prediction.completed` - Predictions generated
- `model.trained` - Model training completed
- `churn.alert` - High-risk customer detected

---

**Last Updated:** January 31, 2024
**Version:** 1.0.0
