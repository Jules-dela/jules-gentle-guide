import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Building, 
  Key, 
  LogOut, 
  Menu,
  X,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: Home },
  { href: '/portal/proposals', label: 'Proposals', icon: Building },
  { href: '/portal/documents', label: 'Documents', icon: FileText },
  { href: '/portal/handover', label: 'Key Handover', icon: Key },
];

export function PortalLayout({ children }: PortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/portal" className="flex items-center gap-2 font-bold text-xl">
              <Home className="w-6 h-6" />
              UNIKEY Portal
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/80">
                <User className="w-4 h-4" />
                {user?.email}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:flex gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
