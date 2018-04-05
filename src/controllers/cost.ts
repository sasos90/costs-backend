import { Request, Response } from 'express';

/**
 * POST /cost
 * Create cost.
 */
export let createCost = (req: Request, res: Response) => {
  res.json('create cost...');
};

/**
 * GET /cost
 * Get all cost.
 */
export let getAllCosts = (req: Request, res: Response) => {
  res.json('get all costs...');
};

/**
 * GET /cost/:id
 * Get cost.
 */
export let getCost = (req: Request, res: Response) => {
  res.json('get cost...');
};

/**
 * PUT /cost/:id
 * Update cost.
 */
export let updateCost = (req: Request, res: Response) => {
  res.json('update cost...');
};

/**
 * DELETE /cost/:id
 * Delete cost.
 */
export let deleteCost = (req: Request, res: Response) => {
  res.json('delete cost...');
};
