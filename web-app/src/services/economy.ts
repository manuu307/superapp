import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_PATH || 'http://localhost:3000/api/v1';

export const beamEnergy = async (token: string, recipientId: string, amount: number, currency: 'lumens' | 'rays') => {
  return await axios.post(`${API_URL}/economy/beam`, { recipientId, amount, currency }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

export const convertEnergy = async (token: string, from: 'lumens' | 'rays', to: 'rays' | 'flares') => {
    return await axios.post(`${API_URL}/economy/convert`, { from, to }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

export const dischargeEnergy = async (token: string, amount: number) => {
    return await axios.post(`${API_URL}/economy/discharge`, { amount }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};
