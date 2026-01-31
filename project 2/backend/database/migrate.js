const { db, dbRun } = require('../server/config/database');

async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');

    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'analyst',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        email TEXT,
        plan TEXT,
        watch_time_hours REAL,
        subscription_age_months INTEGER,
        device_count INTEGER,
        last_login_days INTEGER,
        payment_failures INTEGER,
        last_activity TEXT,
        tenure_months INTEGER,
        churn INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Predictions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        churn_probability REAL NOT NULL,
        confidence REAL,
        prediction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(customer_id, prediction_date),
        FOREIGN KEY (customer_id) REFERENCES customers(user_id)
      )
    `);

    // Model metrics table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS model_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        auc_score REAL NOT NULL,
        precision REAL,
        recall REAL,
        f1_score REAL,
        training_samples INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Feature importance table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS feature_importance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_name TEXT NOT NULL,
        shap_value REAL NOT NULL,
        model_version TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Database schema initialized');
    
    // Seed initial data
    await seedInitialData();
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function seedInitialData() {
  try {
    // Check if data already exists
    const userCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });

    if (userCount > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding initial data...');

    // Insert sample user
    await dbRun(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      ['alex.chen@netflix.com', '$2a$10$mock_hash', 'Alex Chen', 'analyst']
    );

    // Insert sample customers
    const sampleCustomers = [
      ['usr_942183', 'user1@example.com', 'Premium 4K', 450, 14, 3, 2, 0, '2 days ago', 14],
      ['usr_331092', 'user2@example.com', 'Standard', 120, 3, 1, 5, 2, '5 days ago', 3],
      ['usr_776104', 'user3@example.com', 'Basic Ads', 80, 8, 2, 1, 1, 'Yesterday', 8],
      ['usr_210554', 'user4@example.com', 'Premium 4K', 500, 24, 5, 12, 0, '12 days ago', 24]
    ];

    for (const customer of sampleCustomers) {
      await dbRun(
        `INSERT INTO customers 
         (user_id, email, plan, watch_time_hours, subscription_age_months, device_count, 
          last_login_days, payment_failures, last_activity, tenure_months)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        customer
      );
    }

    // Insert sample predictions
    const predictions = [
      ['usr_942183', 0.94, 0.98],
      ['usr_331092', 0.88, 0.96],
      ['usr_776104', 0.71, 0.87],
      ['usr_210554', 0.68, 0.85]
    ];

    for (const pred of predictions) {
      await dbRun(
        'INSERT INTO predictions (customer_id, churn_probability, confidence) VALUES (?, ?, ?)',
        pred
      );
    }

    // Insert model metrics
    await dbRun(
      `INSERT INTO model_metrics (auc_score, precision, recall, f1_score, training_samples)
       VALUES (?, ?, ?, ?, ?)`,
      [0.87, 0.84, 0.89, 0.86, 120000]
    );

    // Insert feature importance
    const features = [
      ['Watch Time', 0.42],
      ['Sub Age', 0.31],
      ['Devices', 0.28],
      ['Last Login', 0.19],
      ['Pay Fail', 0.14]
    ];

    for (const [name, value] of features) {
      await dbRun(
        'INSERT INTO feature_importance (feature_name, shap_value, model_version) VALUES (?, ?, ?)',
        [name, value, process.env.MODEL_VERSION || '2.4.1']
      );
    }

    console.log('✓ Initial data seeded');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

// Run migration on startup
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Database ready!');
    process.exit(0);
  }).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { initializeDatabase };
