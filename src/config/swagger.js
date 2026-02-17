// configue the swagger api documentation
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Field Operations API',
      version: '1.0.0',
      description: 'API documentation for Field Operations Tracking System - manage field agents, data submissions, fraud detection, and analytics',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        FieldAgent: {
          type: 'object',
          required: ['name', 'phone'],
          properties: {
            agent_id: {
              type: 'string',
              format: 'uuid',
              description: 'Auto-generated agent ID (Primary Key)',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: {
              type: 'string',
              description: 'Agent full name',
              example: 'John Doe',
            },
            phone: {
              type: 'string',
              description: 'Unique phone number',
              example: '+919876543210',
            },
            village: {
              type: 'string',
              description: 'Village name',
              example: 'Rampur',
            },
            district: {
              type: 'string',
              description: 'District name',
              example: 'Varanasi',
            },
            state: {
              type: 'string',
              description: 'State name',
              example: 'Uttar Pradesh',
            },
            gps_latitude: {
              type: 'number',
              format: 'double',
              description: 'GPS latitude (Decimal)',
              example: 25.3176,
            },
            gps_longitude: {
              type: 'number',
              format: 'double',
              description: 'GPS longitude (Decimal)',
              example: 82.9739,
            },
            agent_type: {
              type: 'string',
              enum: ['full_time', 'part_time', 'contractor'],
              description: 'Type of agent',
              example: 'full_time',
            },
            registration_date: {
              type: 'string',
              format: 'date',
              description: 'Agent registration date',
              example: '2024-01-15',
            },
            status: {
              type: 'string',
              enum: ['pending_verification', 'active', 'suspended'],
              description: 'Agent status',
              example: 'active',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update timestamp',
            },
          },
        },
        DataSubmission: {
          type: 'object',
          required: ['agent_id', 'category', 'quantity_reported'],
          properties: {
            submission_id: {
              type: 'string',
              format: 'uuid',
              description: 'Auto-generated submission ID (Primary Key)',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            agent_id: {
              type: 'string',
              format: 'uuid',
              description: 'Foreign Key to FieldAgent',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            submission_date: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time of submission',
              example: '2024-01-15T14:30:00Z',
            },
            category: {
              type: 'string',
              enum: ['survey', 'inspection', 'collection', 'delivery'],
              description: 'Submission category',
              example: 'survey',
            },
            location_gps_lat: {
              type: 'number',
              format: 'double',
              description: 'Submission location latitude (Decimal)',
              example: 25.3176,
            },
            location_gps_long: {
              type: 'number',
              format: 'double',
              description: 'Submission location longitude (Decimal)',
              example: 82.9739,
            },
            photo_url: {
              type: 'string',
              description: 'URL to uploaded photo (proof of submission)',
              example: 'https://example.com/photos/123.jpg',
            },
            quantity_reported: {
              type: 'number',
              format: 'double',
              description: 'Reported quantity/measurement (Decimal)',
              example: 7.5,
            },
            quantity_verified: {
              type: 'number',
              format: 'double',
              description: 'Verified quantity (Decimal, nullable - filled later)',
              example: 7.5,
              nullable: true,
            },
            quality_metrics: {
              type: 'object',
              description: 'Quality metrics (auto-calculated based on submission data)',
              readOnly: true,
              properties: {
                completeness_score: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description: 'Completeness score (0-100) - calculated based on filled fields',
                  example: 100,
                },
                accuracy_flag: {
                  type: 'boolean',
                  description: 'Accuracy flag - false if missing GPS, photo, or quantity < 0.1',
                  example: true,
                },
              },
              example: { completeness_score: 100, accuracy_flag: true },
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
              example: 'Sample collected from main location',
            },
            calculated_score: {
              type: 'number',
              format: 'double',
              description: 'Auto-calculated quality score (computed field, Decimal)',
              example: 85.5,
            },
            status: {
              type: 'string',
              enum: ['draft', 'submitted', 'verified', 'rejected', 'flagged'],
              description: 'Submission status',
              example: 'submitted',
            },
            fraud_flags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Fraud detection flags stored as JSONB array',
              example: [],
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp',
            },
            submitted_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when status became "submitted" (auto-set, null for flagged/draft)',
              readOnly: true,
              nullable: true,
            },
            verified_at: {
              type: 'string',
              format: 'date-time',
              description: 'Verification timestamp',
              nullable: true,
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
              example: 10,
            },
            total_count: {
              type: 'integer',
              description: 'Total number of items',
              example: 50,
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 5,
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            details: {
              type: 'object',
              description: 'Field-specific validation errors',
              example: {
                phone: 'Phone number must be in valid format (e.g., +919876543210)',
                gps_coordinates: 'Latitude must be between -90 and 90 degrees',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
