// NEW FILE: lib/apiClient.ts

import axios from 'axios';
import { Clerk } from '@clerk/nextjs/server'; // We need this for the token

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1', // Your FastAPI backend URL
});


export default apiClient;