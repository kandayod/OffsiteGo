import React from 'react';

interface KidzKitzLogoProps {
  className?: string;
  height?: number | string;
}

export default function KidzKitzLogo({ className = '', height = '48px' }: KidzKitzLogoProps) {
  return (
    <svg
      viewBox="0 0 660 165"
      style={{ height }}
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cartoon comic shadow and stroke settings */}
        <filter id="logoShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="3" dy="5" stdDeviation="2" floodOpacity="0.15" />
        </filter>
        <style>{`
          .logo-letter {
            font-family: 'Fredoka One', 'Nunito', 'Arial Rounded MT Bold', 'Inter', 'Comic Sans MS', sans-serif;
            font-weight: 900;
            paint-order: stroke fill;
            stroke: #000000;
            stroke-width: 14px;
            stroke-linejoin: round;
            stroke-linecap: round;
            letter-spacing: -2px;
          }
          .thai-subtext-bg {
            font-family: 'Sarabun', 'Nunito', 'Inter', sans-serif;
            font-weight: 800;
            paint-order: stroke fill;
            stroke: #000000;
            stroke-width: 8px;
            stroke-linejoin: round;
            stroke-linecap: round;
            fill: #000000;
          }
          .thai-subtext-stroke {
            font-family: 'Sarabun', 'Nunito', 'Inter', sans-serif;
            font-weight: 800;
            paint-order: stroke fill;
            stroke: #ffffff;
            stroke-width: 4px;
            stroke-linejoin: round;
            stroke-linecap: round;
            fill: #000000;
          }
        `}</style>
      </defs>

      {/* Main bubble letters with slight overlapping rotations */}
      <g filter="url(#logoShadow)">
        {/* K */}
        <text x="15" y="115" fontSize="135" fill="#E11A22" className="logo-letter" transform="rotate(-3, 60, 80)">K</text>
        {/* i */}
        <text x="105" y="112" fontSize="135" fill="#FFCC00" className="logo-letter" transform="rotate(3, 120, 80)">i</text>
        {/* d */}
        <text x="145" y="115" fontSize="135" fill="#00A753" className="logo-letter" transform="rotate(-2, 190, 80)">d</text>
        {/* z */}
        <text x="230" y="115" fontSize="135" fill="#F26F21" className="logo-letter" transform="rotate(4, 270, 80)">z</text>
        
        {/* & */}
        <text x="315" y="114" fontSize="120" fill="#808285" className="logo-letter" transform="rotate(-1, 350, 80)">&</text>
        
        {/* K */}
        <text x="395" y="115" fontSize="135" fill="#E11A22" className="logo-letter" transform="rotate(-3, 440, 80)">K</text>
        {/* i */}
        <text x="480" y="112" fontSize="135" fill="#FFCC00" className="logo-letter" transform="rotate(3, 500, 80)">i</text>
        {/* t */}
        <text x="522" y="114" fontSize="135" fill="#00A0E9" className="logo-letter" transform="rotate(-2, 550, 80)">t</text>
        {/* z */}
        <text x="572" y="115" fontSize="135" fill="#F26F21" className="logo-letter" transform="rotate(4, 610, 80)">z</text>
      </g>

      {/* Thai subtext below on the right: คิดส์ แอนด์ คิทส์ Co., Ltd. */}
      {/* We layer a black thick stroke first, then a white stroke, then fill with black to match the logo outline look */}
      <g transform="translate(385, 148)" filter="url(#logoShadow)">
        <text x="0" y="0" fontSize="23" className="thai-subtext-bg">คิดส์ แอนด์ คิทส์ Co., Ltd.</text>
        <text x="0" y="0" fontSize="23" className="thai-subtext-stroke">คิดส์ แอนด์ คิทส์ Co., Ltd.</text>
      </g>
    </svg>
  );
}
