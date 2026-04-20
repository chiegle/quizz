import { redirect } from 'next/navigation';

export default function Page() {
  // Simple redirect to dashboard or login. We'll redirect to /login for now.
  redirect('/login');
}
