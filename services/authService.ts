import { User } from '../types';

// This service now acts as the API Client.
// In a real scenario, this would use `fetch` or `axios` to talk to your Node.js/Express server.

export const loginUser = async (email: string, password: string): Promise<User> => {
  console.log("Sending credential to Backend API...", { email, password });
  
  // SIMULATION: Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // SIMULATION: In reality, you would do:
  /*
  const response = await fetch('https://your-api.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  return data.user;
  */

  // Mock Success Response
  if (email && password) {
      return {
          id: 'server_generated_id_123',
          name: email.split('@')[0], // The backend would typically return the name from DB
          email: email
      };
  }
  
  throw new Error('Invalid credentials');
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  console.log("Sending registration data to Backend API...", { name, email, password });

  // SIMULATION: Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock Success Response
  return {
      id: 'server_generated_id_456',
      name: name,
      email: email
  };
};

export const loginWithSocial = async (providerName: 'Google' | 'GitHub' | 'Facebook'): Promise<User> => {
    // Currently disabled/empty as requested
    console.log(`Social login with ${providerName} triggered but not implemented on backend yet.`);
    
    // Throwing error to keep UI in correct state, or could return a dummy user
    throw new Error(`${providerName} login belum disambungkan ke backend.`);
};

export const resetPasswordRequest = async (email: string): Promise<boolean> => {
    console.log("Requesting password reset from Backend API...", email);
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
};