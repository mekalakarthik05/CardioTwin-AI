import axios from 'axios';
import type { AssessmentInput, AssessmentResponse, SimulatorRequest, SimulatorResponse } from '@/types';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// === Prediction API ===
export const predict = async (inputs: AssessmentInput): Promise<AssessmentResponse> => {
  const res = await apiClient.post<AssessmentResponse>('/predict', inputs);
  return res.data;
};

// === Simulator API ===
export const runSimulation = async (body: SimulatorRequest): Promise<SimulatorResponse> => {
  const res = await apiClient.post<SimulatorResponse>('/predict/simulate', body);
  return res.data;
};

// === Report Download ===
export const downloadReport = async (inputs: AssessmentInput, results: any): Promise<void> => {
  const res = await apiClient.post(
    '/report/generate',
    { inputs, results },
    { responseType: 'blob' }
  );
  
  const now = new Date();
  const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
    
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `CardioTwin_Report_${timestamp}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
