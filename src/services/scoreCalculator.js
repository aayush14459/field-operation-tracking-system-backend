/**
 * Calculates quality metrics for a submission
 * @param {Object} submission - Submission data
 * @returns {Object} - Quality metrics with completeness_score and accuracy_flag
 */
const calculateQualityMetrics = (submission) => {
  let completeness_score = 0;
  let accuracy_flag = true;

  // Define required fields for completeness calculation
  const requiredFields = [
    'agent_id',
    'category',
    'quantity_reported',
    'location_gps_lat',
    'location_gps_long',
    'photo_url',
    'notes'
  ];

  // Calculate completeness score based on filled fields
  let filledFields = 0;
  requiredFields.forEach(field => {
    if (submission[field] !== null && submission[field] !== undefined && submission[field] !== '') {
      filledFields++;
    }
  });

  // Completeness score = (filled fields / total fields) * 100
  completeness_score = Math.round((filledFields / requiredFields.length) * 100);

  // Accuracy flag logic - set to false if any of these conditions are met:
  // 1. Missing GPS coordinates
  // 2. Missing photo_url
  // 3. Quantity is suspiciously low (< 0.1)
  
  if (!submission.location_gps_lat || !submission.location_gps_long) {
    accuracy_flag = false;
  }

  if (!submission.photo_url || submission.photo_url.trim() === '') {
    accuracy_flag = false;
  }

  if (parseFloat(submission.quantity_reported) < 0.1) {
    accuracy_flag = false;
  }

  return {
    completeness_score,
    accuracy_flag
  };
};

/**
 * Calculates the score for a submission
 * @param {Object} submission - Submission data
 * @returns {Object} - Object containing calculated_score and quality_metrics
 */
const calculateScore = (submission) => {
  // First, calculate quality metrics if not provided
  const quality_metrics = submission.quality_metrics || calculateQualityMetrics(submission);
  
  // Base Score = quantity_reported * category_multiplier
  const multipliers = {
    'survey': 1.0,
    'inspection': 1.5,
    'collection': 2.0,
    'delivery': 2.5
  };

  const categoryMultiplier = multipliers[submission.category] || 1.0;
  let baseScore = parseFloat(submission.quantity_reported) * categoryMultiplier;

  // Adjustments
  const completeness = quality_metrics.completeness_score || 0;
  const accuracy = quality_metrics.accuracy_flag ?? true; // Default to true if missing

  let adjustmentMultiplier = 1.0;

  // Bonus for high completeness (+10%)
  if (completeness >= 90) {
    adjustmentMultiplier += 0.10;
  }
  // Penalty for low completeness (-20%)
  else if (completeness < 50) {
    adjustmentMultiplier -= 0.20;
  }

  // Penalty for inaccuracy (-15%)
  if (accuracy === false) {
    adjustmentMultiplier -= 0.15;
  }

  // Ensure multiplier doesn't go below 0 (optional safety)
  if (adjustmentMultiplier < 0) adjustmentMultiplier = 0;

  // Final Score = Base Score * adjustments
  const finalScore = baseScore * adjustmentMultiplier;

  // Round to 2 decimals
  const calculated_score = Math.round(finalScore * 100) / 100;
  
  return {
    calculated_score,
    quality_metrics
  };
};

module.exports = { calculateScore, calculateQualityMetrics };
