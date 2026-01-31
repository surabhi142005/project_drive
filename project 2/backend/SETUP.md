# RetainStream Backend - Getting Started Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# ML Service dependencies
cd ml_service
pip install -r requirements.txt
cd ..
```

### Step 2: Initialize Database

```bash
npm run migrate
```

### Step 3: Run Services

**Terminal 1 - ML Service:**
```bash
cd backend/ml_service
python service.py
```

**Terminal 2 - API Server:**
```bash
cd backend
npm start
```

### Step 4: Test

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex.chen@netflix.com","password":"password"}'

# Get dashboard metrics
curl http://localhost:5000/api/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Documentation

### Authentication

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "alex.chen@netflix.com",
  "password": "password"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "alex.chen@netflix.com",
      "name": "Alex Chen",
      "role": "analyst"
    }
  }
}
```

### Dashboard Endpoints

**Get Metrics**
```
GET /api/dashboard/metrics
Authorization: Bearer {token}
```

Response:
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

**Get High-Risk Customers**
```
GET /api/customers/high-risk?page=1&limit=10
Authorization: Bearer {token}
```

**Run Predictions**
```
POST /api/dashboard/predict
Authorization: Bearer {token}

{
  "sample_size": 100
}
```

## ML Service Endpoints

### Generate Predictions
```
POST http://localhost:5001/api/predict
Content-Type: application/json

{
  "sample_size": 100
}
```

Response:
```json
{
  "success": true,
  "predictions": [
    {
      "customer_id": "usr_1000000",
      "probability": 0.85,
      "confidence": 0.92
    }
  ],
  "avg_probability": 0.45,
  "timestamp": "2024-01-31T..."
}
```

## Configuration

Edit `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000
PYTHON_SERVICE_URL=http://localhost:5001

# Database
DATABASE_PATH=./database/retainstream.db

# JWT
JWT_SECRET=your_secure_secret_key

# Model
ML_MODEL_PATH=./ml_service/models/xgboost_model.pkl
CONFIDENCE_THRESHOLD=0.7
MODEL_VERSION=2.4.1
```

## Training the Model

```bash
cd backend/ml_service
python train_model.py
```

This will:
- Generate 120K training samples
- Train XGBoost model
- Print performance metrics
- Save model to `models/xgboost_model.pkl`

## Database

### Tables

1. **users** - System users and analysts
2. **customers** - Customer data and activity
3. **predictions** - Churn predictions
4. **model_metrics** - Model performance tracking
5. **feature_importance** - Feature SHAP values

## Development

```bash
npm run dev  # Auto-reload on changes
```

## Production Checklist

- [ ] Change JWT_SECRET to secure random string
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS properly
- [ ] Use production database
- [ ] Set up SSL/HTTPS
- [ ] Configure error logging
- [ ] Set up monitoring/alerts
- [ ] Run security audit

## Troubleshooting

### ML Service Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5001
```
Make sure ML service is running on terminal 1.

### Database Locked
```
Error: database is locked
```
Close other connections to database file.

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
Change PORT in .env or kill process on port 5000.

## Performance Tips

1. **Prediction Caching:** Results cached for 5 minutes
2. **Batch Operations:** Process customers in batches of 100
3. **Database Indexing:** Indices on customer_id and prediction_date
4. **Model Inference:** ~10ms per prediction

---

**Need help?** Check the main [README.md](./README.md)
