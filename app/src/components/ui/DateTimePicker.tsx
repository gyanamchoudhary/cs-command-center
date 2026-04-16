import { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Calendar as CalendarIcon, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  timezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  showTimezone?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Common timezones
const commonTimezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

// Auto-detect user's timezone
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

// Get timezone offset string (e.g., "+05:30", "-08:00")
export function getTimezoneOffsetString(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart?.value || '';
  } catch {
    return '';
  }
}

// Convert local datetime to UTC ISO string
export function toUTC(localDateTime: string, timezone: string): string {
  if (!localDateTime) return '';
  
  try {
    // Parse the local datetime
    const date = new Date(localDateTime);
    
    // Create a formatter for the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    // Get the parts
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';
    
    // Reconstruct as UTC
    const utcDate = new Date(
      parseInt(getPart('year')),
      parseInt(getPart('month')) - 1,
      parseInt(getPart('day')),
      parseInt(getPart('hour')),
      parseInt(getPart('minute')),
      parseInt(getPart('second'))
    );
    
    return utcDate.toISOString();
  } catch {
    return new Date(localDateTime).toISOString();
  }
}

// Convert UTC ISO string to local datetime for input
export function fromUTC(utcDateTime: string, timezone: string): string {
  if (!utcDateTime) return '';
  
  try {
    const date = new Date(utcDateTime);
    
    // Format for the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
    
    // Return in datetime-local format (YYYY-MM-DDTHH:mm)
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    const date = new Date(utcDateTime);
    return date.toISOString().slice(0, 16);
  }
}

// Format datetime for display (dd/mm/yyyy hh:mm)
export function formatDateTimeDisplay(dateTime: string, timezone: string): string {
  if (!dateTime) return '';
  
  try {
    const localValue = fromUTC(dateTime, timezone);
    const date = new Date(localValue);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateTime;
  }
}

export function DateTimePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date and time',
  timezone = detectTimezone(),
  onTimezoneChange,
  showTimezone = true,
  disabled = false,
  required = false,
  className,
}: DateTimePickerProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);
  const [date, setDate] = useState<Date | undefined>(value ? new Date(fromUTC(value, selectedTimezone)) : undefined);
  const [time, setTime] = useState(value ? fromUTC(value, selectedTimezone).split('T')[1]?.slice(0, 5) || '00:00' : '00:00');
  const [isOpen, setIsOpen] = useState(false);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const localValue = fromUTC(value, selectedTimezone);
      setDate(new Date(localValue));
      setTime(localValue.split('T')[1]?.slice(0, 5) || '00:00');
    }
  }, [value, selectedTimezone]);

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const dateStr = format(newDate, 'yyyy-MM-dd');
      const localDateTime = `${dateStr}T${time}`;
      const utcValue = toUTC(localDateTime, selectedTimezone);
      onChange(utcValue);
    }
    setIsOpen(false);
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const localDateTime = `${dateStr}T${newTime}`;
      const utcValue = toUTC(localDateTime, selectedTimezone);
      onChange(utcValue);
    }
  };

  // Handle timezone change
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setSelectedTimezone(newTimezone);
    onTimezoneChange?.(newTimezone);
    
    // Convert existing value to new timezone
    if (value && date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const localDateTime = `${dateStr}T${time}`;
      const utcValue = toUTC(localDateTime, newTimezone);
      onChange(utcValue);
    }
  };

  // Display value
  const displayValue = date 
    ? `${format(date, 'dd/MM/yyyy')} ${time}`
    : placeholder;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="flex flex-col gap-2">
        {/* Date and Time Selection */}
        <div className="flex gap-2">
          {/* Date Picker */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'flex-1 justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {displayValue}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Time Input */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              disabled={disabled || !date}
              className="pl-9 w-32"
            />
          </div>
        </div>

        {/* Timezone Selector */}
        {showTimezone && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <select
              value={selectedTimezone}
              onChange={handleTimezoneChange}
              disabled={disabled}
              className="flex-1 h-9 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commonTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} {getTimezoneOffsetString(tz.value)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* UTC Display */}
        {value && (
          <p className="text-xs text-gray-500">
            Stored in UTC: {new Date(value).toISOString().replace('T', ' ').slice(0, 19)}
          </p>
        )}
      </div>
    </div>
  );
}

// Simple datetime input that stores in UTC
export function SimpleDateTimeInput({
  value,
  onChange,
  label,
  disabled = false,
  required = false,
  className,
}: Omit<DateTimePickerProps, 'showTimezone' | 'timezone' | 'onTimezoneChange'>) {
  const userTimezone = detectTimezone();
  
  // Convert UTC value to local for input
  const localValue = value ? fromUTC(value, userTimezone) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localDateTime = e.target.value;
    if (localDateTime) {
      const utcValue = toUTC(localDateTime, userTimezone);
      onChange(utcValue);
    } else {
      onChange('');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Input
        type="datetime-local"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      />
      {value && (
        <p className="text-xs text-gray-500">
          Display: {formatDateTimeDisplay(value, userTimezone)} ({userTimezone})
        </p>
      )}
    </div>
  );
}
