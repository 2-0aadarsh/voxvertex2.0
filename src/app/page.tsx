
// Redirect to /home route for better performance
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/home');
}
