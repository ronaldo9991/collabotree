import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = (res: Response, data: any, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, error: string, statusCode = 400, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error,
    details,
  });
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    error: message,
  });
};

export const sendForbidden = (res: Response, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    error: message,
  });
};

export const sendNotFound = (res: Response, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    error: message,
  });
};

export const sendConflict = (res: Response, message: string, details?: any) => {
  return res.status(409).json({
    success: false,
    error: message,
    details,
  });
};

export const sendValidationError = (res: Response, errors: any) => {
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    details: errors,
  });
};

export const sendInternalError = (res: Response, message = 'Internal server error') => {
  return res.status(500).json({
    success: false,
    error: message,
  });
};
