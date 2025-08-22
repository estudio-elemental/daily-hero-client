export const handleApiError = (error, navigate) => {
  if (error.status === 401) {
    localStorage.removeItem('token');
    navigate('/login');
  }
  return error;
};

export const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (response.status === 401) {
      throw { status: 401, message: 'Sessão expirada' };
    }
    return response;
  } catch (error) {
    throw { status: error.status || 500, message: error.message };
  }
};
