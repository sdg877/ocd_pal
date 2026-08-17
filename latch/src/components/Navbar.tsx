import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 border-b items-center">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/profile">Profile</Link>
      <LogoutButton />
    </nav>
  )
}