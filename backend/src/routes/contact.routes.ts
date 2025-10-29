import { Router } from 'express';
import { submitContactForm } from '../controllers/contact.controller.js';

const router = Router();

// Contact form submission (public endpoint)
router.post('/', submitContactForm);

export default router;



