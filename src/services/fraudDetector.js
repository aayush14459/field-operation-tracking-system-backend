const DataSubmission = require('../models/DataSubmission');
const FieldAgent = require('../models/FieldAgent');

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const detectFraud = async (submission, agent) => {
  const flags = [];

  // 1. GPS Mismatch: > 10km from agent's registered location
  if (agent.gps_latitude && agent.gps_longitude && submission.location_gps_lat && submission.location_gps_long) {
    const distance = calculateDistance(
      parseFloat(agent.gps_latitude),
      parseFloat(agent.gps_longitude),
      parseFloat(submission.location_gps_lat),
      parseFloat(submission.location_gps_long)
    );
    if (distance > 10) {
      flags.push('GPS Mismatch');
    }
  }

  // 2. Impossible Value: quantity_reported > 1000
  if (parseFloat(submission.quantity_reported) > 1000) {
    flags.push('Impossible Value');
  }

  // 3. Velocity Check: > 5 submissions within 1 hour
  const oneHourAgo = new Date(new Date() - 60 * 60 * 1000);
  const recentSubmissionsCount = await DataSubmission.countSubmissionsByAgentSince(agent.agent_id, oneHourAgo);
  

  //  4. "If submitting more than 5 with in 1 hour". So  they have 5 already and try the 6th submission.
  if (recentSubmissionsCount >= 5) {
    flags.push('Velocity Check');
  }

  // 4. Duplicate Detection: Same quantity + category + submisison within 30 minutes
  const thirtyMinutesAgo = new Date(new Date() - 30 * 60 * 1000);
  const duplicate = await DataSubmission.findDuplicateSubmission(
    agent.agent_id, 
    submission.quantity_reported, 
    submission.category, 
    thirtyMinutesAgo
  );

  if (duplicate) {
    flags.push('Duplicate Detection');
  }

  return flags;
};

module.exports = { detectFraud };
