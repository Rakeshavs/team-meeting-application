import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function saveUser(user) {
  // 1. Existing Firebase save (Keeping as backup)
  try {
    await setDoc(doc(db, 'users', user.id), {
      name: user.name,
      email: user.email,
      profilePic: user.picture,
    });
  } catch (error) {
    console.warn('Firebase user save failed, continuing to Supabase...', error);
  }

  // 2. New Supabase Sync via Backend
  try {
    const response = await fetch('http://localhost:8000/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Supabase user sync failed:', errorData);
    } else {
      console.log('User successfully synchronized to Supabase Cloud.');
    }
  } catch (error) {
    console.error('Error connecting to backend for user sync:', error);
  }
}
