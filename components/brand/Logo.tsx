// components/brand/Logo.tsx
import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function VokaraStackedLogo({ className, ...props }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 50"
      className={className}
      fill="none"
      {...props}
    >
      <g fill="currentColor">
        {/* Icon */}
        <g transform="translate(14, 5) scale(0.077)">
          <circle cx="209.23" cy="259.33" r="55.72"/>
          <path d="M368.47,259.33l50-50-83.71-83.71h0L209.08,0,158.71,50.36l25,25A176.9,176.9,0,0,0,83.35,125.65L0,209l50.33,50.33L0,309.64l209,209L259.4,468.3l-25.06-25.07A176.93,176.93,0,0,0,334.73,393L418,309.67l.05.05.39-.4Zm-97.3,63.12a87.87,87.87,0,0,1-124.26,0L83.77,259.31l63.14-63.14a87.87,87.87,0,0,1,124.26,0l63.14,63.14Z"/>
        </g>
        {/* Divider */}
        <rect x="53" y="8" width="1.5" height="34" opacity={0.6}/>
        {/* Text */}
        <g transform="translate(61, 23)" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: "16px", letterSpacing: "-1px" }}>
          <text y="0">VEK</text>
          <text y="14">ORA</text>
        </g>
      </g>
    </svg>
  );
}

export function VokaraHorizontalLogo({ className, ...props }: LogoProps) {
  return (
    <svg 
      width="115" 
      height="21" 
      viewBox="0 0 115 21" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill="currentColor">
        {/* Left Icon (Same original shape) */}
        <g transform="scale(0.8) translate(0, 2)">
          <path d="M8.5 12.756C9.75017 12.756 10.7636 11.746 10.7636 10.5C10.7636 9.25402 9.75017 8.24396 8.5 8.24396C7.24983 8.24396 6.23637 9.25402 6.23637 10.5C6.23637 11.746 7.24983 12.756 8.5 12.756Z"/>
          <path d="M14.9691 10.5L17.0004 8.47555L13.5997 5.08622L8.49391 0L6.44762 2.03902L7.46325 3.05125C5.91844 3.27082 4.48731 3.98555 3.38611 5.08744L0 8.46219L2.04466 10.5L0 12.537L8.49066 20.9992L10.5382 18.961L9.5201 17.9459C11.065 17.7272 12.4965 17.0133 13.5985 15.9122L16.9813 12.5382L16.9833 12.5402L16.9992 12.524L14.9691 10.5ZM11.0163 13.0557C10.3469 13.7228 9.43896 14.0976 8.49228 14.0976C7.5456 14.0976 6.63768 13.7228 5.96824 13.0557L3.40317 10.4992L5.96824 7.94272C6.63768 7.27559 7.5456 6.90081 8.49228 6.90081C9.43896 6.90081 10.3469 7.27559 11.0163 7.94272L13.5814 10.4992L11.0163 13.0557Z"/>
        </g>
        
        {/* Divider */}
        <rect x="20" y="2" width="1" height="17" opacity={0.6}/>
        
        {/* Text */}
        <text 
          x="28" 
          y="15.5" 
          style={{ 
            fontFamily: "'Space Grotesk', sans-serif", 
            fontWeight: 900, 
            fontSize: "14px", 
            letterSpacing: "0.5px"
          }}
        >
          VEKORA
        </text>
      </g>
    </svg>
  );
}
