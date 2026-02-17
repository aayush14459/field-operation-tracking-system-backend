const db = require('../config/db');

// Create Submission
const createSubmission = async (submissionData) => {
    const {
        agent_id, category, location_gps_lat, location_gps_long, photo_url,
        quantity_reported, quality_metrics, notes, calculated_score,
        status, fraud_flags, submitted_at
    } = submissionData;

    const query = `
        INSERT INTO data_submissions (
            agent_id, category, location_gps_lat, location_gps_long, photo_url,
            quantity_reported, quality_metrics, notes, calculated_score,
            status, fraud_flags, submission_date, submitted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, $12)
        RETURNING *;
    `;

    const values = [
        agent_id, category, location_gps_lat, location_gps_long, photo_url,
        quantity_reported, quality_metrics, notes, calculated_score,
        status, JSON.stringify(fraud_flags), submitted_at
    ];

    try {
        const { rows } = await db.query(query, values);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get Submission by ID with Agent details
const getSubmissionById = async (id) => {
    const query = `
        SELECT ds.*, 
               fa.name as agent_name, 
               fa.phone as agent_phone 
        FROM data_submissions ds
        JOIN field_agents fa ON ds.agent_id = fa.agent_id
        WHERE ds.submission_id = $1
    `;
    try {
        const { rows } = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get All Submissions with Pagination, Filters, and Agent details
const getAllSubmissions = async (limit, offset, filters = {}) => {
    let whereClause = '';
    const queryParams = [];
    let paramIndex = 1;

    // Build WHERE clause based on filters
    const conditions = [];
    
    if (filters.agent_id) {
        conditions.push(`ds.agent_id = $${paramIndex}`);
        queryParams.push(filters.agent_id);
        paramIndex++;
    }

    if (filters.status) {
        conditions.push(`ds.status = $${paramIndex}`);
        queryParams.push(filters.status);
        paramIndex++;
    }
    
    if (filters.category) {
        conditions.push(`ds.category = $${paramIndex}`);
        queryParams.push(filters.category);
        paramIndex++;
    }

    if (filters.agent_type) {
        conditions.push(`fa.agent_type = $${paramIndex}`);
        queryParams.push(filters.agent_type);
        paramIndex++;
    }
    
    if (filters.start_date) {
        conditions.push(`ds.submission_date >= $${paramIndex}`);
        queryParams.push(filters.start_date);
        paramIndex++;
    }
    
    if (filters.end_date) {
        conditions.push(`ds.submission_date <= $${paramIndex}`);
        queryParams.push(filters.end_date);
        paramIndex++;
    }
    
    if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const query = `
        SELECT ds.*, fa.name as agent_name
        FROM data_submissions ds
        JOIN field_agents fa ON ds.agent_id = fa.agent_id
        ${whereClause}
        ORDER BY ds.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const countQuery = `SELECT COUNT(*) FROM data_submissions ds ${whereClause}`;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset for count
    
    try {
        const { rows } = await db.query(query, queryParams);
        const countResult = await db.query(countQuery, countParams);
        return {
            rows,
            count: parseInt(countResult.rows[0].count)
        };
    } catch (error) {
        throw error;
    }
};

// Get Submissions by Agent ID
const getSubmissionsByAgentId = async (agentId, limit, offset) => {
    const query = `
        SELECT * FROM data_submissions
        WHERE agent_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
    `;
    const countQuery = 'SELECT COUNT(*) FROM data_submissions WHERE agent_id = $1';

    try {
        const { rows } = await db.query(query, [agentId, limit, offset]);
        const countResult = await db.query(countQuery, [agentId]);
        return {
            rows,
            count: parseInt(countResult.rows[0].count)
        };
    } catch (error) {
        throw error;
    }
};

// Update Submission (Verify)
const updateSubmissionStatus = async (id, status, quantityVerified) => {
    let query = `
        UPDATE data_submissions
        SET status = $2, verified_at = CURRENT_TIMESTAMP
        WHERE submission_id = $1
        RETURNING *;
    `;
    let values = [id, status];

    if (quantityVerified !== undefined) {
        query = `
            UPDATE data_submissions
            SET status = $2, quantity_verified = $3, verified_at = CURRENT_TIMESTAMP
            WHERE submission_id = $1
            RETURNING *;
        `;
        values = [id, status, quantityVerified];
    }

    try {
        const { rows } = await db.query(query, values);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Analytics
const getAnalytics = async () => {
    try {
        // Total Submissions
        const totalQuery = 'SELECT COUNT(*) FROM data_submissions';
        
        // Breakdown by Status
        const statusQuery = `
            SELECT status, COUNT(*) as count
            FROM data_submissions 
            GROUP BY status
        `;

        // Breakdown by Region (State) via Field Agents
        const regionQuery = `
            SELECT fa.state, COUNT(ds.submission_id) as count
            FROM data_submissions ds
            JOIN field_agents fa ON ds.agent_id = fa.agent_id
            GROUP BY fa.state
        `;
        
        // Breakdown by Category
        const categoryQuery = `
           SELECT category, COUNT(*) as count
           FROM data_submissions
           GROUP BY category
        `;

        const [totalRes, statusRes, regionRes, categoryRes] = await Promise.all([
            db.query(totalQuery),
            db.query(statusQuery),
            db.query(regionQuery),
            db.query(categoryQuery)
        ]);

        const statusBreakdown = {};
        statusRes.rows.forEach(row => {
            statusBreakdown[row.status] = parseInt(row.count);
        });

        const regionBreakdown = {};
        regionRes.rows.forEach(row => {
            if (row.state) {
                regionBreakdown[row.state] = parseInt(row.count);
            }
        });
        
        const categoryBreakdown = {};
        categoryRes.rows.forEach(row => {
             categoryBreakdown[row.category] = parseInt(row.count);
        });

        return {
            total_submissions: parseInt(totalRes.rows[0].count),
            status_breakdown: statusBreakdown,
            region_breakdown: regionBreakdown,
            category_breakdown: categoryBreakdown
        };
    } catch (error) {
        throw error;
    }
};

// Helper for Fraud Detection: Count recent submissions
const countSubmissionsByAgentSince = async (agentId, sinceDate) => {
    const query = 'SELECT COUNT(*) FROM data_submissions WHERE agent_id = $1 AND created_at >= $2';
    try {
        const { rows } = await db.query(query, [agentId, sinceDate]);
        return parseInt(rows[0].count);
    } catch (error) {
        throw error;
    }
};

// Helper for Fraud Detection: Find duplicate
const findDuplicateSubmission = async (agentId, quantity, category, sinceDate) => {
    const query = `
        SELECT * FROM data_submissions 
        WHERE agent_id = $1 
        AND quantity_reported = $2 
        AND category = $3 
        AND created_at >= $4
        LIMIT 1
    `;
    try {
        const { rows } = await db.query(query, [agentId, quantity, category, sinceDate]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Helper: Get Agent Stats
const getAgentStats = async (agentId) => {
    try {
        const totalQuery = 'SELECT COUNT(*) FROM data_submissions WHERE agent_id = $1';
        const flaggedQuery = "SELECT COUNT(*) FROM data_submissions WHERE agent_id = $1 AND status = 'flagged'";
        const verifiedQuery = "SELECT COUNT(*) FROM data_submissions WHERE agent_id = $1 AND status = 'verified'";

        const [totalRes, flaggedRes, verifiedRes] = await Promise.all([
            db.query(totalQuery, [agentId]),
            db.query(flaggedQuery, [agentId]),
            db.query(verifiedQuery, [agentId])
        ]);

        return {
            total_submissions: parseInt(totalRes.rows[0].count),
            flagged: parseInt(flaggedRes.rows[0].count),
            verified: parseInt(verifiedRes.rows[0].count)
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createSubmission,
    getSubmissionById,
    getAllSubmissions,
    getSubmissionsByAgentId,
    updateSubmissionStatus,
    getAnalytics,
    countSubmissionsByAgentSince,
    findDuplicateSubmission,
    getAgentStats
};
