import Link from "next/link";
import { FolderKanban, LogIn, UsersRound } from "lucide-react";

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="brand" href="/projects">
          <FolderKanban aria-hidden="true" size={22} />
          <span>Project API Client</span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/projects">
            <FolderKanban aria-hidden="true" size={16} />
            Projects
          </Link>
          <Link href="/users">
            <UsersRound aria-hidden="true" size={16} />
            Users
          </Link>
          <Link href="/login">
            <LogIn aria-hidden="true" size={16} />
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
