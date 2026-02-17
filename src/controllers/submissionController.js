const DataSubmission = require('../models/DataSubmission');
const FieldAgent = require('../models/FieldAgent');
const { calculateScore } = require('../services/scoreCalculator');
const { detectFraud } = require('../services/fraudDetector');

// POST /submissions
exports.createSubmission = async (req, res) => {
  try {
    const { agent_id, category, location_gps_lat, location_gps_long, quantity_reported, photo_url, notes } = req.body;

    // Validation is now handled by middleware
    const agent = await FieldAgent.getFieldAgentById(agent_id);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Prepare submission object
    const submissionData = {
      agent_id,
      category,
      location_gps_lat,
      location_gps_long,
      quantity_reported,
      photo_url,
      notes
    };

    // Calculate Score and Quality Metrics (both calculated automatically)
    const { calculated_score, quality_metrics } = calculateScore(submissionData);
    submissionData.calculated_score = calculated_score;
    submissionData.quality_metrics = JSON.stringify(quality_metrics);

    // Detect Fraud
    const flags = await detectFraud(submissionData, agent);
    submissionData.fraud_flags = flags;
    submissionData.status = flags.length > 0 ? 'flagged' : 'submitted';
    
    // Set submitted_at timestamp
    // Only set if status is 'submitted', otherwise null
    submissionData.submitted_at = submissionData.status === 'submitted' ? new Date() : null;

    // Save to DB
    const newSubmission = await DataSubmission.createSubmission(submissionData);

    res.status(201).json({ success: true, data: newSubmission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error creating submission' });
  }
};



// GET /submissions/:id
exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await DataSubmission.getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error fetching submission' });
  }
};

// PATCH /submissions/:id/verify
exports.verifySubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quantity_verified } = req.body;

    // These Validation is handled by middleware
    const submission = await DataSubmission.getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    const updatedSubmission = await DataSubmission.updateSubmissionStatus(id, status, quantity_verified);
    res.json({ success: true, data: updatedSubmission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error updating submission' });
  }
};

// GET /analytics/summary
exports.getAnalytics = async (req, res) => {
    try {
        const analytics = await DataSubmission.getAnalytics();
        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error fetching analytics' });
    }
};
