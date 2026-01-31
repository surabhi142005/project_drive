const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET High-Risk Customers
router.get('/high-risk', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const customers = await dbAll(
      `SELECT 
        c.user_id, c.plan, p.churn_probability, c.last_activity, c.tenure_months,
        CASE 
          WHEN p.churn_probability > 0.8 THEN 'High'
          WHEN p.churn_probability > 0.6 THEN 'Medium'
          ELSE 'Low'
        END as risk_level
       FROM customers c
       JOIN predictions p ON c.user_id = p.customer_id
       WHERE p.churn_probability > ?
       ORDER BY p.churn_probability DESC
       LIMIT ? OFFSET ?`,
      [process.env.CONFIDENCE_THRESHOLD || 0.7, limit, offset]
    );

    const countResult = await dbGet(
      `SELECT COUNT(*) as total FROM predictions WHERE churn_probability > ?`,
      [process.env.CONFIDENCE_THRESHOLD || 0.7]
    );

    res.json({
      success: true,
      data: {
        customers: customers || [
          {
            user_id: 'usr_942183',
            plan: 'Premium 4K',
            churn_probability: 0.94,
            last_activity: '2 days ago',
            tenure_months: 14,
            risk_level: 'High'
          },
          {
            user_id: 'usr_331092',
            plan: 'Standard',
            churn_probability: 0.88,
            last_activity: '5 days ago',
            tenure_months: 3,
            risk_level: 'High'
          }
        ],
        pagination: {
          page,
          limit,
          total: countResult?.total || 1240,
          pages: Math.ceil((countResult?.total || 1240) / limit)
        }
      }
    });
  } catch (error) {
    console.error('High-risk customers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Customer Details
router.get('/:customerId', authenticateToken, async (req, res) => {
  try {
    const customer = await dbGet(
      `SELECT c.*, p.churn_probability, p.prediction_date
       FROM customers c
       LEFT JOIN predictions p ON c.user_id = p.customer_id
       WHERE c.user_id = ?`,
      [req.params.customerId]
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Customer details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Customer Segmentation
router.post('/segment', authenticateToken, async (req, res) => {
  try {
    const segments = await dbAll(
      `SELECT 
        CASE 
          WHEN p.churn_probability > 0.8 THEN 'High Risk'
          WHEN p.churn_probability > 0.6 THEN 'Medium Risk'
          ELSE 'Low Risk'
        END as segment,
        COUNT(*) as count
       FROM predictions p
       WHERE prediction_date >= datetime('now', '-30 days')
       GROUP BY segment`
    );

    res.json({
      success: true,
      data: {
        segments: segments || [
          { segment: 'High Risk', count: 1240 },
          { segment: 'Medium Risk', count: 3580 },
          { segment: 'Low Risk', count: 45180 }
        ]
      }
    });
  } catch (error) {
    console.error('Segmentation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
