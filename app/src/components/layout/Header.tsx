import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }[];
  filters?: {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
}

export function Header({
  title,
  subtitle,
  searchPlaceholder = 'Search...',
  onSearch,
  actions = [],
  filters = [],
}: HeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className={cn(
                  action.variant === 'default' && 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mt-4">
          {onSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          
          {filters.length > 0 && (
            <div className="flex items-center gap-2">
              {filters.map((filter, index) => (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {filter.label}: {filter.options.find(o => o.value === filter.value)?.label || 'All'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {filter.options.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => filter.onChange(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
