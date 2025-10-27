// Placeholder file - contracts functionality has been simplified
// This file exists only to prevent build errors during Railway deployment
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import { sendError } from '../utils/responses.js';

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
