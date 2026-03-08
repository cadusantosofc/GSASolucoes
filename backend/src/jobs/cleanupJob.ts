import cron from 'node-cron';
import * as HistoryService from '../services/HistoryService';

// Executar limpeza de links expirados a cada hora
export const startCleanupJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await HistoryService.cleanExpiredLinks();
      console.log(`🧹 Limpeza automática: ${result.deleted} links expirados removidos`);
    } catch (error) {
      console.error('Erro na limpeza de links expirados:', error);
    }
  });

  console.log('✅ Job de limpeza de links iniciado (executa a cada hora)');
};
