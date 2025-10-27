// This file is a placeholder to prevent TypeScript compilation errors
// The actual contracts functionality is handled by contracts.controller.simple.ts
// which is imported through contracts.controller.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import { sendError } from '../utils/responses.js';

// All contract functions are disabled and return 501 Not Implemented
// This prevents Railway build errors while keeping the codebase clean

export const createContract = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const getContract = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const updateContract = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const deleteContract = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const listContracts = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const signContract = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const updateProgress = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const markCompleted = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

export const raiseDispute = async (req: AuthenticatedRequest, res: Response) => {
  return sendError(res, 'Contract functionality temporarily disabled', 501);
};

// Export a dummy default to satisfy any default imports
export default {
  createContract,
  getContract,
  updateContract,
  deleteContract,
  listContracts,
  signContract,
  processPayment,
  updateProgress,
  markCompleted,
  raiseDispute
};

