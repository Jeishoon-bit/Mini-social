import React from "react"

interface LogoProps {
  width?: number | string
  height?: number | string
  color?: string
  className?: string
}

export default function Logo({
  width = 32,
  height = 32,
  color = "currentColor",
  className,
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13C14.7614 13 17 10.7614 17 8Z"
        fill={color}
        opacity="0.3"
      />
      <path
        d="M20 21C20 17.6863 16.4183 15 12 15C7.58172 15 4 17.6863 4 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="3" fill={color} />
      <path
        d="M6 9.5C4.5 9.5 3 8.38 3 7C3 5.62 4.5 4.5 6 4.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M5 12C3.8 12.3 2.5 13.4 2 15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M18 9.5C19.5 9.5 21 8.38 21 7C21 5.62 19.5 4.5 18 4.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M19 12C20.2 12.3 21.5 13.4 22 15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
