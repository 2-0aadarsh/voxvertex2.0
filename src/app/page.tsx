
// Redirect to /home route for better performance
import { redirect } from 'next/navigation';

export default function Home() {
  // Temporarily disabled to fix subscription flow
  redirect('/home');
  // return null;
}
