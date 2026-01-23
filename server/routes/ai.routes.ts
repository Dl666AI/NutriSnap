import { Router, Request, Response } from 'express';
import { AIService } from '../services/ai.service';

/**
 * CONTROLLER/ROUTES: AI Analysis
 * Handles food image and text analysis using Gemini AI
 */

const router = Router();
const aiService = new AIService();

/**
 * POST /api/analyze/image
 * Analyze a food image
 */
router.post('/image', async (req: Request, res: Response) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image required' });
        }

        const result = await aiService.analyzeFoodImage(image);
        res.json(result);
    } catch (error: any) {
        console.error('[POST /api/analyze/image] AI Error:', error);
        res.status(500).json({ error: 'AI failed', details: error.message });
    }
});

/**
 * POST /api/analyze/text
 * Analyze a food description
 */
router.post('/text', async (req: Request, res: Response) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Description required' });
        }

        const result = await aiService.analyzeFoodText(description);
        res.json(result);
    } catch (error: any) {
        console.error('[POST /api/analyze/text] AI Error:', error);
        res.status(500).json({ error: 'AI failed', details: error.message });
    }
});

export default router;
