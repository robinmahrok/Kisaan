import express from 'express';

// Import your existing route modules (keeping them as they are)
import loginRoutes from './loginRoutes.js';
import seedRoutes from './seedRoutes.js';

const router = express.Router();

// Apply your existing route modules to the router
// This preserves all your current logic exactly as it is
loginRoutes(router);
seedRoutes(router);

export default router; 