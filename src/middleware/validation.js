// Input Validation Middleware
// Provides comprehensive validation for API requests with detailed error messages

/**
 * Validates GPS coordinates and returns error message if invalid
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {string|null} - Error message or null if valid
 */
const validateCoordinates = (latitude, longitude) => {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return null; // Optional fields
  }

  const lat = parseFloat(latitude);
  const long = parseFloat(longitude);

  if (isNaN(lat) || isNaN(long)) {
    return 'GPS coordinates must be valid numbers';
  }

  if (lat < -90 || lat > 90) {
    return 'Latitude must be between -90 and 90 degrees';
  }

  if (long < -180 || long > 180) {
    return 'Longitude must be between -180 and 180 degrees';
  }

  return null;
};

/**
 * Validates phone number format (basic E.164 format)
 * @param {string} phone - Phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
const validatePhoneNumber = (phone) => {
  if (!phone) {
    return 'Phone number is required';
  }

  // Basic E.164 format: +[country code][number]
  // Should start with + and contain only digits after that 
  //strict check for phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  
  if (!phoneRegex.test(phone)) {
    return 'Phone number must be in valid format (e.g., +919876543210)';
  }

  return null;
};

/**
 * Validates enum value
 * @param {string} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
const validateEnum = (value, allowedValues, fieldName) => {
  if (!value) {
    return null; // Optional field
  }

  if (!allowedValues.includes(value)) {
    return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }

  return null;
};

/**
 * Validates numeric range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
const validateNumericRange = (value, min, max, fieldName) => {
  if (value === null || value === undefined) {
    return null; // Optional field
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }

  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }

  return null;
};

/**
 * Middleware: Validate agent registration
 */
const validateAgentRegistration = (req, res, next) => {
  const errors = {};
  const { name, phone, gps_latitude, gps_longitude, agent_type, status } = req.body;

  // Required fields
  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  // Phone validation
  const phoneError = validatePhoneNumber(phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  // GPS coordinates validation
  const gpsError = validateCoordinates(gps_latitude, gps_longitude);
  if (gpsError) {
    errors.gps_coordinates = gpsError;
  }

  // Agent type enum validation
  const agentTypeError = validateEnum(
    agent_type,
    ['full_time', 'part_time', 'contractor'],
    'agent_type'
  );
  if (agentTypeError) {
    errors.agent_type = agentTypeError;
  }

  // Status enum validation
  const statusError = validateEnum(
    status,
    ['pending_verification', 'active', 'suspended'],
    'status'
  );
  if (statusError) {
    errors.status = statusError;
  }

  // If there are validation errors, return 422
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware: Validate data submission
 */
const validateSubmission = (req, res, next) => {
  const errors = {};
  const {
    agent_id,
    category,
    location_gps_lat,
    location_gps_long,
    quantity_reported
  } = req.body;

  // Required fields
  if (!agent_id) {
    errors.agent_id = 'Agent ID is required';
  }

  if (!category) {
    errors.category = 'Category is required';
  }

  if (quantity_reported === null || quantity_reported === undefined) {
    errors.quantity_reported = 'Quantity reported is required';
  }

  // Category enum validation
  const categoryError = validateEnum(
    category,
    ['survey', 'inspection', 'collection', 'delivery'],
    'category'
  );
  if (categoryError) {
    errors.category = categoryError;
  }

  // GPS coordinates validation
  const gpsError = validateCoordinates(location_gps_lat, location_gps_long);
  if (gpsError) {
    errors.location_gps = gpsError;
  }

  // Quantity validation (must be positive)
  const quantityError = validateNumericRange(quantity_reported, 0.01, 10000, 'quantity_reported');
  if (quantityError) {
    errors.quantity_reported = quantityError;
  }



  // If there are validation errors, return 422
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Middleware: Validate submission update (verify/reject)
 */
const validateSubmissionUpdate = (req, res, next) => {
  const errors = {};
  const { status, quantity_verified } = req.body;

  // Status validation
  if (!status) {
    errors.status = 'Status is required';
  } else {
    const statusError = validateEnum(
      status,
      ['verified', 'rejected'],
      'status'
    );
    if (statusError) {
      errors.status = statusError;
    }
  }

  // Quantity verified validation (optional) but it is good if provide a value for verified
  if (quantity_verified !== null && quantity_verified !== undefined) {
    const quantityError = validateNumericRange(
      quantity_verified,
      0.01,
      10000,
      'quantity_verified'
    );
    if (quantityError) {
      errors.quantity_verified = quantityError;
    }
  }

  // If there are validation errors, return 422
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateAgentRegistration,
  validateSubmission,
  validateSubmissionUpdate,
  validatePhoneNumber,
  validateEnum,
  validateNumericRange
};
