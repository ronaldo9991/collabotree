import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendValidationError } from '../utils/responses.js';

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
  type: z.enum(['general', 'support', 'partnership', 'media'], {
    errorMap: () => ({ message: 'Invalid inquiry type' })
  })
});

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    console.log('🔍 submitContactForm called with body:', req.body);
    
    const validatedData = contactFormSchema.parse(req.body);
    
    console.log('📝 Contact form data:', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      type: validatedData.type,
      messageLength: validatedData.message.length
    });

    // In a real application, you would:
    // 1. Save the contact form submission to the database
    // 2. Send an email notification to the admin team
    // 3. Send an auto-reply to the user
    
    // For now, we'll simulate a successful submission
    // TODO: Implement actual email sending functionality
    
    console.log('✅ Contact form submitted successfully');
    
    return sendSuccess(res, {
      id: `contact_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'received'
    }, 'Contact form submitted successfully. We will get back to you within 24 hours.');
    
  } catch (error) {
    console.error('❌ Error in submitContactForm:', error);
    
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    
    return sendError(res, 'Failed to submit contact form', 500);
  }
};
