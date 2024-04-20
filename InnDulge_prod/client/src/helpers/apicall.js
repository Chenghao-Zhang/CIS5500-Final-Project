const config = require('../config.json');

export async function apiCall(method, endpoint, data = null) {
    const response = await fetch(`http://${config.server_host}:${config.server_port}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('Something went wrong!');
    }
  
    return response.json();
};