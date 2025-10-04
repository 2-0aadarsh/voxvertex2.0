import cron from 'node-cron';
import { cleanupExpiredReservations } from '../controllers/enhancedEventRegisterController.js';

/**
 * Background job to automatically cleanup expired reservations
 * Runs every 5 minutes to check for expired reservations
 */
export const startReservationCleanupJob = () => {
  console.log('🕐 Starting reservation cleanup job...');
  
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🧹 Running reservation cleanup job...');
    try {
      await cleanupExpiredReservations();
    } catch (error) {
      console.error('❌ Reservation cleanup job failed:', error);
    }
  });
  
  console.log('✅ Reservation cleanup job started (runs every 5 minutes)');
};

export default startReservationCleanupJob;
