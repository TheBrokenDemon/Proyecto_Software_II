import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import {
  getActiveEvaluations,
  getEvaluationWithQuestions,
  submitEvaluationResponses,
  getMyHistory,
} from '../services/evaluation.service';

export const listEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const evaluations = await getActiveEvaluations();
    res.status(200).json({ evaluations });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const evaluation = await getEvaluationWithQuestions(req.params.slug);
    res.status(200).json({ evaluation });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const submitResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const result = await submitEvaluationResponses(user.id, req.params.slug, req.body.answers);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const myHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const history = await getMyHistory(user.id);
    res.status(200).json({ history });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};