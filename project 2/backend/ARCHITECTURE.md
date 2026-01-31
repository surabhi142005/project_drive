# RetainStream Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/JS)                       │
│              Netflix-style Dashboard UI                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Express.js API Server                      │
│                    (Node.js on :5000)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes                                                │ │
│  │  ├─ /api/auth        (Authentication)                 │ │
│  │  ├─ /api/dashboard   (Metrics & Predictions)          │ │
│  │  ├─ /api/customers   (Customer Data)                  │ │
│  │  ├─ /api/predictions (Churn Predictions)              │ │
│  │  └─ /api/model       (Model Management)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Middleware                                            │ │
│  │  ├─ JWT Authentication                                │ │
│  │  ├─ CORS & Security                                   │ │
│  │  └─ Error Handling                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└────────┬─────────────────────┬────────────────────────────┬──┘
         │                     │                            │
    HTTP │                     │ HTTP                       │ SQLite
         │                     │                            │
┌────────▼──┐       ┌──────────▼────────┐       ┌──────────▼──┐
│   Python  │       │   SQLite 3        │       │  Analytics  │
│ ML Service│       │   Database        │       │  Logging    │
│           │       │                   │       │             │
│ XGBoost   │       │  ┌─────────────┐  │       │ Metrics &   │
│ Predictions       │  │   users     │  │       │ Audit Trail │
│ (:5001)   │       │  ├─────────────┤  │       │             │
│           │       │  │ customers   │  │       │             │
│ Flask API │       │  ├─────────────┤  │       │             │
│           │       │  │ predictions │  │       │             │
└───────────┘       │  ├─────────────┤  │       └─────────────┘
                    │  │model_metrics│  │
                    │  ├─────────────┤  │
                    │  │   features  │  │
                    │  └─────────────┘  │
                    └────────────────────┘
```

---

## Component Architecture

### 1. Frontend Layer
**File:** `code.html`

- Dashboard UI built with Tailwind CSS
- Dark mode support
- Real-time metric display
- Interactive charts and tables
- Responsive design

### 2. API Layer (Node.js/Express)
**Directory:** `server/`

#### Entry Point
- **app.js** - Express application initialization
  - CORS configuration
  - Middleware setup
  - Route registration
  - Error handling

#### Configuration
- **config/database.js** - SQLite connection and helpers
  - `dbRun()` - Execute SQL commands
  - `dbGet()` - Fetch single row
  - `dbAll()` - Fetch multiple rows

#### Middleware
- **middleware/auth.js** - JWT authentication
  - `authenticateToken()` - Verify JWT
  - `generateToken()` - Create JWT

#### Routes
1. **routes/auth.js** - User authentication
   - `POST /auth/login` - User login
   - `POST /auth/register` - User registration

2. **routes/dashboard.js** - Dashboard metrics
   - `GET /dashboard/metrics` - KPI metrics
   - `GET /dashboard/distribution` - Churn distribution
   - `GET /dashboard/features` - Top features
   - `POST /dashboard/predict` - Trigger predictions

3. **routes/customers.js** - Customer management
   - `GET /customers/high-risk` - High-risk customers
   - `GET /customers/:customerId` - Customer details
   - `POST /customers/segment` - Segmentation

4. **routes/predictions.js** - Prediction management
   - `GET /predictions/results` - Prediction results
   - `POST /predictions/generate` - Generate predictions
   - `GET /predictions/performance` - Model performance

5. **routes/model.js** - Model management
   - `GET /model/status` - Model status
   - `POST /model/train` - Train model
   - `GET /model/features` - Feature importance

### 3. ML Service (Python/Flask)
**Directory:** `ml_service/`

#### service.py - Flask API
- `GET /api/health` - Health check
- `POST /api/predict` - Generate predictions
- `POST /api/train` - Train XGBoost model
- `GET /api/features` - Feature importance

#### train_model.py - Model Training
- `ChurnPredictor` class
- Data generation (120K samples)
- XGBoost model training
- Hyperparameter optimization
- Model evaluation
- Model persistence

**Features:**
- Watch time (hours)
- Subscription age (months)
- Device count
- Last login (days)
- Payment failures

### 4. Data Layer (SQLite)
**Directory:** `database/`

#### Database Schema
```sql
users
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── name
├── role
└── created_at

customers
├── id (PK)
├── user_id (UNIQUE)
├── plan
├── watch_time_hours
├── subscription_age_months
├── device_count
├── last_login_days
├── payment_failures
├── tenure_months
├── churn
└── created_at

predictions
├── id (PK)
├── customer_id (FK)
├── churn_probability
├── confidence
└── prediction_date

model_metrics
├── id (PK)
├── auc_score
├── precision
├── recall
├── f1_score
├── training_samples
└── created_at

feature_importance
├── id (PK)
├── feature_name
├── shap_value
├── model_version
└── created_at
```

#### migrate.js - Database Initialization
- Create tables
- Seed initial data
- Setup indices
- Foreign key constraints

---

## Data Flow

### 1. Authentication Flow
```
User Input (Email/Password)
    ↓
POST /auth/login
    ↓
Verify credentials
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Store token (localStorage)
```

### 2. Dashboard Metrics Flow
```
GET /dashboard/metrics (with JWT)
    ↓
Verify token
    ↓
Query database:
  - Current churn rate
  - Predicted churners count
  - Model AUC score
    ↓
Return aggregated metrics
    ↓
Display on frontend
```

### 3. Prediction Flow
```
POST /api/dashboard/predict
    ↓
Node API receives request
    ↓
Call Python ML Service
    ↓
Python generates predictions
    ↓
Store in database
    ↓
Return results
    ↓
Update dashboard
```

### 4. Model Training Flow
```
POST /api/model/train
    ↓
Python generates training data
    ↓
Train XGBoost model
    ↓
Evaluate performance
    ↓
Calculate metrics (AUC, Precision, etc.)
    ↓
Save model to disk
    ↓
Store metrics in DB
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | HTML5/CSS3/JavaScript | Latest |
| **Frontend Framework** | Tailwind CSS | 3.x |
| **Backend** | Node.js | 16+ |
| **Web Framework** | Express.js | 4.18 |
| **Authentication** | JWT | jsonwebtoken 9.1 |
| **Database** | SQLite3 | 5.1 |
| **ML Service** | Python | 3.8+ |
| **ML Framework** | scikit-learn | 1.3 |
| **ML Model** | XGBoost | 2.0 |
| **ML API** | Flask | 2.3 |
| **Data Processing** | Pandas | 2.0 |
| **Numerical** | NumPy | 1.24 |

---

## Deployment Architecture

### Development
```
┌─────────────────────────────────────────┐
│  Developer Machine                      │
│  ├─ Frontend: http://localhost:3000     │
│  ├─ API: http://localhost:5000          │
│  ├─ ML: http://localhost:5001           │
│  └─ Database: SQLite (local)            │
└─────────────────────────────────────────┘
```

### Production
```
┌──────────────────────────────────────────────────────┐
│  Docker Container Orchestration (Kubernetes)         │
│  ├─ Frontend Service (Nginx)                         │
│  │  └─ Static assets                                 │
│  ├─ API Service (Node.js)                            │
│  │  └─ 3 replicas (load balanced)                    │
│  ├─ ML Service (Python/Flask)                        │
│  │  └─ 2 replicas (GPU enabled)                      │
│  └─ Data Layer                                       │
│     ├─ PostgreSQL (persistent)                       │
│     ├─ Redis (cache)                                 │
│     └─ S3 (model storage)                            │
└──────────────────────────────────────────────────────┘
```

---

## Performance Characteristics

### API Performance
| Endpoint | Latency | Throughput |
|----------|---------|-----------|
| /dashboard/metrics | 50-100ms | 1000 req/s |
| /customers/high-risk | 100-200ms | 500 req/s |
| /predictions/generate | 500ms-5s | 100 req/s |
| /model/train | 30-60s | 1 req/s |

### ML Service Performance
| Operation | Latency | Notes |
|-----------|---------|-------|
| Single prediction | ~5ms | Per customer |
| Batch prediction (100) | ~100ms | 100 customers |
| Model training | 30-60s | 120K samples |
| Feature extraction | <1ms | Per sample |

### Database Performance
| Operation | Latency |
|-----------|---------|
| Customer lookup | 5-10ms |
| Prediction insert | 10-20ms |
| Metrics aggregation | 50-100ms |

---

## Security Architecture

### Authentication
```
Frontend (token)
    ↓
JWT verification in middleware
    ↓
Extract user ID
    ↓
Check permissions
    ↓
Allow/Deny request
```

### Data Protection
- **In Transit:** HTTPS/TLS 1.3
- **At Rest:** Database encryption
- **Passwords:** bcrypt hashing (salt rounds: 10)
- **Secrets:** Environment variables

### API Security
- CORS whitelist
- Rate limiting (100 req/15min)
- Input validation (express-validator)
- SQL injection prevention (parameterized queries)
- XSS protection (Helmet headers)
- CSRF protection

---

## Scalability Considerations

### Horizontal Scaling
- Stateless Node.js services
- Load balancer (Nginx/HAProxy)
- Database connection pooling
- Caching layer (Redis)

### Vertical Scaling
- Increase container resources
- Database indexing
- Query optimization
- Connection pooling

### ML Model Scaling
- Model versioning
- A/B testing framework
- Batch prediction support
- Async processing queue (RabbitMQ/Celery)

---

## Monitoring & Observability

### Metrics to Track
- API response time
- Error rate
- Prediction accuracy
- Model performance drift
- Database query time
- ML service latency

### Logging
- Application logs (Winston/Bunyan)
- Access logs (Morgan)
- Error logging (Sentry)
- Audit logs (Database)

### Alerting
- CPU > 80%
- Memory > 90%
- Error rate > 1%
- API latency > 500ms
- Model AUC < 0.85

---

## Development Workflow

```
1. Feature Development
   └─ npm run dev (auto-reload)

2. Testing
   └─ npm test

3. Code Review
   └─ ESLint + Prettier

4. Staging
   └─ Deploy to staging env

5. Production
   └─ Docker push + deploy

6. Monitoring
   └─ Check metrics & logs
```

---

## Future Enhancements

### Phase 2
- [ ] Real-time WebSocket updates
- [ ] Advanced filtering & search
- [ ] Custom reporting
- [ ] Email notifications
- [ ] Slack integration

### Phase 3
- [ ] Ensemble models
- [ ] AutoML pipeline
- [ ] Feature engineering
- [ ] Model explainability (LIME)
- [ ] API versioning

### Phase 4
- [ ] Mobile app
- [ ] Multi-tenancy
- [ ] Advanced analytics
- [ ] Data warehousing
- [ ] BI tool integration

---

**Architecture Version:** 1.0.0  
**Last Updated:** January 31, 2024  
**Maintainer:** RetainStream Team
