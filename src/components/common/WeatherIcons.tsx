import React from 'react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = '', size = 28 }) => {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className
  };

  switch (name) {
    case 'sun':
      return (
        <svg {...iconProps} stroke="#f59e0b">
          <circle cx="12" cy="12" r="5" fill="#f59e0b" fillOpacity="0.2" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );

    case 'cloud-sun':
      return (
        <svg {...iconProps}>
          <path d="M12 2v2" stroke="#f59e0b" />
          <path d="m4.93 4.93 1.41 1.41" stroke="#f59e0b" />
          <path d="M20 12h2" stroke="#f59e0b" />
          <path d="m19.07 4.93-1.41 1.41" stroke="#f59e0b" />
          <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" stroke="#f59e0b" />
          <path
            d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity="0.15"
          />
        </svg>
      );

    case 'cloud':
      return (
        <svg {...iconProps} stroke="#94a3b8">
          <path
            d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
            fill="#94a3b8"
            fillOpacity="0.15"
          />
        </svg>
      );

    case 'rain':
      return (
        <svg {...iconProps} stroke="#38bdf8">
          <path d="M16 13a4 4 0 0 0-8 0" />
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
          <line x1="8" y1="19" x2="8" y2="21" stroke="#00e5ff" strokeWidth="2.5" />
          <line x1="12" y1="19" x2="12" y2="21" stroke="#00e5ff" strokeWidth="2.5" />
          <line x1="16" y1="19" x2="16" y2="21" stroke="#00e5ff" strokeWidth="2.5" />
        </svg>
      );

    case 'drizzle':
      return (
        <svg {...iconProps} stroke="#38bdf8">
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
          <line x1="9" y1="19" x2="9" y2="20" stroke="#00e5ff" strokeWidth="2" />
          <line x1="15" y1="19" x2="15" y2="20" stroke="#00e5ff" strokeWidth="2" />
        </svg>
      );

    case 'snow':
      return (
        <svg {...iconProps} stroke="#e0f2fe">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
          <circle cx="8" cy="20" r="1" fill="#e0f2fe" />
          <circle cx="12" cy="19" r="1" fill="#e0f2fe" />
          <circle cx="16" cy="20" r="1" fill="#e0f2fe" />
        </svg>
      );

    case 'thunderstorm':
      return (
        <svg {...iconProps} stroke="#fbbf24">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" stroke="#94a3b8" />
          <polyline points="13 11 9 17 15 17 11 23" fill="#fbbf24" fillOpacity="0.3" />
        </svg>
      );

    case 'fog':
      return (
        <svg {...iconProps} stroke="#94a3b8">
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="3" y1="14" x2="21" y2="14" />
          <line x1="6" y1="18" x2="18" y2="18" />
          <line x1="8" y1="6" x2="16" y2="6" />
        </svg>
      );

    default:
      return (
        <svg {...iconProps} stroke="#38bdf8">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
        </svg>
      );
  }
};
