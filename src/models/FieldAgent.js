const db = require('../config/db');

// Create Agent
const createFieldAgent = async (agentData) => {
  const { name, phone, village, district, state, gps_latitude, gps_longitude, agent_type, status } = agentData;
  const query = `
    INSERT INTO field_agents (
      name, phone, village, district, state, gps_latitude, gps_longitude, agent_type, status, registration_date
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
    RETURNING *;
  `;
  const values = [name, phone, village, district, state, gps_latitude, gps_longitude, agent_type, status];
  
  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get Agent by ID
const getFieldAgentById = async (id) => {
  const query = 'SELECT * FROM field_agents WHERE agent_id = $1';
  try {
    const { rows } = await db.query(query, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get All Agents with Pagination and Filters
const getAllFieldAgents = async (limit, offset, filters = {}) => {
    let whereClause = '';
    const queryParams = [];
    let paramIndex = 1;

    // Build WHERE clause based on filters
    const conditions = [];
    
    if (filters.agent_type) {
        conditions.push(`agent_type = $${paramIndex}`);
        queryParams.push(filters.agent_type);
        paramIndex++;
    }
    
    if (filters.status) {
        conditions.push(`status = $${paramIndex}`);
        queryParams.push(filters.status);
        paramIndex++;
    }
    
    if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const query = `
        SELECT * FROM field_agents 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const countQuery = `SELECT COUNT(*) FROM field_agents ${whereClause}`;
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

module.exports = {
  createFieldAgent,
  getFieldAgentById,
  getAllFieldAgents
};
