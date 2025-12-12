import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const MedicareLogo: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 150 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="75" y="32" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#4B5563">MEDICARE</text>
  </svg>
);

export const MedicaidLogo: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 150 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="75" y="32" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#4B5563">MEDICAID</text>
  </svg>
);

export const AnthemLogo: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 150 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="75" y="32" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#4B5563">Anthem.</text>
  </svg>
);

export const UnitedHealthcareLogo: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 150 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
     <path d="M22.5 15.5 L32.5 15.5 L32.5 25.5 L42.5 25.5 L42.5 35.5 L32.5 35.5 L32.5 45.5 L22.5 45.5 Z" fill="#4B5563" strokeWidth="3" opacity="0.7" />
    <text x="95" y="32" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#4B5563">UnitedHealthcare</text>
  </svg>
);

export const CignaLogo: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 150 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="75" y="32" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#4B5563">Cigna</text>
  </svg>
);

export const AetnaLogo: React.FC<IconProps> = (props) => (
  <svg {...props} viewBox="0 0 150 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="75" y="35" fontFamily="Inter, sans-serif" fontStyle="italic" fontSize="28" fontWeight="bold" textAnchor="middle" fill="#4B5563">aetna</text>
  </svg>
);
