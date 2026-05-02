import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { vehicleSchedulerService } from '../services/vehicleScheduler';
import { notificationService } from '../services/notificationService';
import { Log } from '../../logging_middleware';

export class ApiController {
  
  async health(req: Request, res: Response) {
    await Log('backend', 'info', 'controller', 'Health check requested');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  async registerAndAuth(req: Request, res: Response) {
    try {
      await Log('backend', 'info', 'controller', 'Register and auth requested');
      
      if (req.body && Object.keys(req.body).length > 0) {
        const { updateConfig, config } = await import('../config/env');
        updateConfig({
          email: req.body.email || config.email,
          name: req.body.name || config.name,
          mobile: req.body.mobileNo || config.mobile,
          githubUsername: req.body.githubUsername || config.githubUsername,
          rollNo: req.body.rollNo || config.rollNo,
          accessCode: req.body.accessCode || config.accessCode
        });
      }

      const result = await authService.registerAndAuth();
      res.json(result);
    } catch (error: any) {
      console.error('[Auth Error]:', error);
      res.status(500).json({ 
        error: 'Auth failed', 
        details: error.message || 'Unknown error'
      });
    }
  }

  async solveVehicleScheduling(req: Request, res: Response) {
    try {
      await Log('backend', 'info', 'controller', 'Vehicle scheduling requested');
      const result = await vehicleSchedulerService.solve();
      res.json(result);
    } catch (error: any) {
      console.error('[Scheduler Error]:', error);
      res.status(500).json({ 
        error: 'Vehicle scheduling failed', 
        details: error.message || 'Unknown error' 
      });
    }
  }

  async getPriorityNotifications(req: Request, res: Response) {
    try {
      await Log('backend', 'info', 'controller', 'Priority notifications requested');
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await notificationService.getPriorityInbox(limit);
      res.json(result);
    } catch (error: any) {
      console.error('[Notification Error]:', error);
      res.status(500).json({ 
        error: 'Notification priority failed', 
        details: error.message || 'Unknown error' 
      });
    }
  }
}

export const apiController = new ApiController();
