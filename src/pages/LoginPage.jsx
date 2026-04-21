import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser } from '../services/userService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const persistUser = async (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));

    try {
      await saveUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleGoogleSuccess = async (response) => {
    const user = jwtDecode(response.credential);
    const userData = {
      id: user.email,
      name: user.name,
      email: user.email,
      picture: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
    };

    await persistUser(userData);
    window.location.href = '/';
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email) {
      alert('Enter your Gmail');
      return;
    }

    const userData = {
      id: email,
      name: email,
      email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}`,
    };

    await persistUser(userData);
    navigate('/');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
      <div className="backdrop-blur-xl bg-white/70 border border-white/30 w-[380px] p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">Welcome</h1>

        

          

      

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
        </div>
      </div>
    </div>
  );
}
