import API from './axios';

// গুগল লগইনের জন্য এপিআই কল
export const loginWithGoogle = async (idToken) => {
  const response = await API.post('/auth/google', { idToken });
  return response.data;
};

// স্টুডেন্ট ড্যাশবোর্ড বা লিডারবোর্ড ডেটা আনা
export const getDashboardData = async () => {
  const response = await API.get('/user/dashboard');
  return response.data;
};

// স্টুডেন্টের সেকশনে জয়েন করার রিকোয়েস্ট
export const joinSection = async (token) => {
  const response = await API.post('/user/join', { token });
  return response.data;
};