const FieldAgent = require('../models/FieldAgent');
const DataSubmission = require('../models/DataSubmission');

// POST /agents
exports.createAgent = async (req, res) => {
  try {
    const { name, phone, village, district, state, gps_latitude, gps_longitude, agent_type, status } = req.body;
    
    // Validation is handled by middleware
    const agent = await FieldAgent.createFieldAgent({
      name,
      phone,
      village,
      district,
      state,
      gps_latitude,
      gps_longitude,
      agent_type,
      status: status || 'active' // Default to active
    });

    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // Postgres unique_violation code
      return res.status(409).json({ success: false, error: 'Phone number already registered' });
    }
    res.status(500).json({ success: false, error: 'Server error creating agent' });
  }
};

// GET /agents/:id
exports.getAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await FieldAgent.getFieldAgentById(id);

    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Fetch submission stats
    const stats = await DataSubmission.getAgentStats(id);

    res.json({ success: true, data: { ...agent, stats } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error fetching agent' });
  }
};





// GET /agents/:id/submissions
exports.getAgentSubmissions = async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status, category, start_date, end_date } = req.query;
      const offset = (page - 1) * limit;
  
      const filters = {
          agent_id: id,
          ...(status && { status }),
          ...(category && { category }),
          ...(start_date && { start_date }),
          ...(end_date && { end_date })
      };

      const result = await DataSubmission.getAllSubmissions(parseInt(limit), parseInt(offset), filters);
  
      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total_count: result.count,
          pages: Math.ceil(result.count / limit)
        },
        filters: filters
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server error fetching agent submissions' });
    }
  };
