import { redirect } from 'next/navigation';

export default function HandbooksPage() {
  redirect('/downloads?category=handbook');
}
