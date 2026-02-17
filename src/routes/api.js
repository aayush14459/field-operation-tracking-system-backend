const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const submissionController = require('../controllers/submissionController');
const { validateAgentRegistration, validateSubmission, validateSubmissionUpdate } = require('../middleware/validation');

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Register a new field agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               village:
 *                 type: string
 *                 example: Rampur
 *               district:
 *                 type: string
 *                 example: Varanasi
 *               state:
 *                 type: string
 *                 example: Uttar Pradesh
 *               gps_latitude:
 *                 type: number
 *                 format: float
 *                 example: 25.3176
 *               gps_longitude:
 *                 type: number
 *                 format: float
 *                 example: 82.9739
 *               agent_type:
 *                 type: string
 *                 enum: [full_time, part_time, contractor]
 *                 example: contractor
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FieldAgent'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Phone number already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/agents', validateAgentRegistration, agentController.createAgent);



/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: Get agent details by ID
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent details with submission stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/FieldAgent'
 *                     - type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                           properties:
 *                             total_submissions:
 *                               type: integer
 *                             verified_submissions:
 *                               type: integer
 *                             flagged_submissions:
 *                               type: integer
 *       404:
 *         description: Agent not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/agents/:id', agentController.getAgent);



/**
 * @swagger
 * /api/agents/{id}/submissions:
 *   get:
 *     summary: Get all submissions by a specific agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Agent ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, submitted, verified, rejected, flagged]
 *         description: Filter by submission status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [survey, inspection, collection, delivery]
 *         description: Filter submissions by category
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter submissions from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter submissions until this date
 *     responses:
 *       200:
 *         description: List of agent submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataSubmission'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/agents/:id/submissions', agentController.getAgentSubmissions);

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Create a new data submission
 *     tags: [Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agent_id
 *               - category
 *               - quantity_reported
 *             properties:
 *               agent_id:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               category:
 *                 type: string
 *                 enum: [survey, inspection, collection, delivery]
 *                 example: survey
 *               location_gps_lat:
 *                 type: number
 *                 format: float
 *                 example: 25.3176
 *               location_gps_long:
 *                 type: number
 *                 format: float
 *                 example: 82.9739
 *               quantity_reported:
 *                 type: number
 *                 example: 7.5
 *               photo_url:
 *                 type: string
 *                 example: "https://example.com/photos/123.jpg"
 *               notes:
 *                 type: string
 *                 example: "Sample survey from farming"
 *             description: |
 *               Note: quality_metrics (completeness_score and accuracy_flag) are automatically calculated based on the submission data and do not need to be provided.
 *     responses:
 *       201:
 *         description: Submission created successfully (quality_metrics are auto-calculated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/DataSubmission'
 *                     - type: object
 *                       properties:
 *                         quality_metrics:
 *                           type: object
 *                           description: Auto-calculated based on submission data
 *                           properties:
 *                             completeness_score:
 *                               type: integer
 *                               example: 100
 *                             accuracy_flag:
 *                               type: boolean
 *                               example: true
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Agent not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/submissions', validateSubmission, submissionController.createSubmission);



/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get submission details by ID
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataSubmission'
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/submissions/:id', submissionController.getSubmission);

/**
 * @swagger
 * /api/submissions/{id}/verify:
 *   patch:
 *     summary: Verify or reject a submission
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [verified, rejected]
 *                 example: verified
 *               quantity_verified:
 *                 type: number
 *                 example: 7.5
 *     responses:
 *       200:
 *         description: Submission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DataSubmission'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/submissions/:id/verify', validateSubmissionUpdate, submissionController.verifySubmission);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Analytics summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_submissions:
 *                       type: integer
 *                       example: 150
 *                     status_breakdown:
 *                       type: object
 *                       description: Count of submissions by status
 *                       example: { "draft": 5, "submitted": 20, "verified": 70, "rejected": 5, "flagged": 2 }
 *                     region_breakdown:
 *                       type: object
 *                       description: Count of submissions by state/region
 *                       example: { "Maharashtra": 50, "Karnataka": 40, "Delhi": 60 }
 *                     category_breakdown:
 *                       type: object
 *                       description: Count of submissions by category
 *                       example: { "survey": 50, "inspection": 40, "collection": 30, "delivery": 20 }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/analytics/summary', submissionController.getAnalytics);

module.exports = router;
