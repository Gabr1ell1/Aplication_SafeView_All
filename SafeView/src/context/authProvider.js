import { useEffect, useState } from 'react';
import { AuthContext } from './authContext';   
import { getUser, saveUser, logoutUser } from '../services/authStorage';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const storedUser = await getUser();
      setUser(storedUser);
    })();
  }, []);

  const login = async (data) => {
    await saveUser(data);
    setUser(data);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
