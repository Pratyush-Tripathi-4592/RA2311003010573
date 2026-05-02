import { evaluationClient } from '../clients/evaluationClient';
import { Log } from '../../logging_middleware';

export class VehicleSchedulerService {
  async solve() {
    await Log('backend', 'info', 'service', 'Starting vehicle scheduler solver');

    try {
      await Log('backend', 'info', 'service', 'Fetching depots and vehicles');
      const [depotsData, vehiclesData] = await Promise.all([
        evaluationClient.getDepots(),
        evaluationClient.getVehicles()
      ]);

      await Log('backend', 'info', 'service', 'Data fetched successfully');

      // Robust parsing for depot
      // Expected depots array. Pick the one with the highest hours if multiple.
      const depots = Array.isArray(depotsData) ? depotsData : (depotsData.depots || []);
      if (!depots || depots.length === 0) {
        throw new Error('No depots found');
      }

      // Pick first or best depot
      let bestDepot = depots[0];
      for (const d of depots) {
        const h1 = Number(d.mechanicHours || d.capacity || d.hours || 0);
        const h2 = Number(bestDepot.mechanicHours || bestDepot.capacity || bestDepot.hours || 0);
        if (h1 > h2) bestDepot = d;
      }

      const mechanicHours = Number(bestDepot.mechanicHours || bestDepot.capacity || bestDepot.hours || 0);
      
      // Robust parsing for vehicles/tasks
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData.vehicles || vehiclesData.tasks || []);
      let allTasks: any[] = [];

      for (const v of vehicles) {
        if (v.tasks && Array.isArray(v.tasks)) {
          allTasks = allTasks.concat(v.tasks);
        } else if (v.id && (v.duration !== undefined || v.time !== undefined)) {
          // If the vehicle itself is a task
          allTasks.push(v);
        }
      }

      // Filter out invalid tasks
      const items = allTasks.map(t => {
        return {
          id: t.id || t.taskId || t.task_id,
          duration: Number(t.duration || t.time || t.cost || 0),
          impact: Number(t.impact || t.value || t.score || 0),
          original: t
        };
      }).filter(t => t.id && t.duration > 0 && t.impact > 0);

      await Log('backend', 'info', 'service', `Parsed ${items.length} tasks and depot capacity: ${mechanicHours}`);

      // 1D DP Knapsack
      const maxCapacity = Math.floor(mechanicHours);
      if (maxCapacity <= 0 || items.length === 0) {
        return {
          depotUsed: bestDepot.id || bestDepot.name || 'Unknown',
          totalDuration: 0,
          totalImpact: 0,
          selectedTaskIDs: [],
          debug: 'Invalid capacity or empty tasks'
        };
      }

      await Log('backend', 'info', 'service', 'Starting 1D DP solver');

      // dp[w] stores max impact for capacity w
      const dp = new Array(maxCapacity + 1).fill(0);
      // to reconstruct, we keep track of which items were picked.
      // keep history of items picked for each capacity. (Can be heavy for large maxCapacity, but needed for reconstruction).
      // A more memory efficient way for reconstruction is to store a 2D boolean array or array of arrays, but for 1D DP:
      const picked = Array.from({ length: maxCapacity + 1 }, () => [] as number[]);

      for (let i = 0; i < items.length; i++) {
        const w = items[i].duration;
        const v = items[i].impact;
        // Traverse backwards to avoid using the same item multiple times (0/1 knapsack)
        for (let cap = maxCapacity; cap >= w; cap--) {
          if (dp[cap - w] + v > dp[cap]) {
            dp[cap] = dp[cap - w] + v;
            picked[cap] = [...picked[cap - w], i]; // copy previous path and add current item
          }
        }
      }

      await Log('backend', 'info', 'service', 'DP table created and solved');

      // Reconstruct
      let bestCap = 0;
      for (let cap = 0; cap <= maxCapacity; cap++) {
        if (dp[cap] > dp[bestCap]) {
          bestCap = cap;
        }
      }

      const selectedIndices = picked[bestCap];
      const selectedTasks = selectedIndices.map(idx => items[idx]);
      const selectedTaskIDs = selectedTasks.map(t => t.id);
      
      const totalImpact = dp[bestCap];
      const totalDuration = selectedTasks.reduce((sum, t) => sum + t.duration, 0);

      await Log('backend', 'info', 'service', 'Reconstruction complete');

      const result = {
        depotUsed: bestDepot.id || bestDepot.name || 'Unknown',
        totalDuration,
        totalImpact,
        selectedTaskIDs,
        debug: {
          itemsConsidered: items.length,
          mechanicHours,
          maxImpactFound: totalImpact
        }
      };

      await Log('backend', 'success', 'service', 'Scheduler solved successfully');
      return result;

    } catch (error: any) {
      await Log('backend', 'error', 'service', `Scheduler failed: ${error.message}`);
      throw error;
    }
  }
}

export const vehicleSchedulerService = new VehicleSchedulerService();
