import type { SVGProps } from "react"

const BriefcaseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <g stroke={props.stroke || "currentColor"} strokeWidth={1.5} clipPath="url(#a)">
      <path d="M13.333 5c0-1.572 0-2.357-.488-2.845S11.572 1.667 10 1.667c-1.572 0-2.357 0-2.845.488S6.667 3.428 6.667 5m-5 6.667c0-3.143 0-4.715.976-5.69C3.62 5 5.191 5 8.333 5h3.334c3.142 0 4.714 0 5.69.977.976.976.976 2.547.976 5.69 0 3.142 0 4.714-.976 5.69-.977.976-2.548.976-5.69.976H8.333c-3.142 0-4.714 0-5.69-.976-.975-.977-.976-2.548-.976-5.69Z" />
      <path
        strokeLinecap="round"
        d="M10 14.444c.92 0 1.667-.622 1.667-1.388 0-.767-.746-1.39-1.667-1.39-.92 0-1.667-.621-1.667-1.389 0-.766.746-1.388 1.667-1.388m0 5.555c-.92 0-1.667-.622-1.667-1.388M10 14.444V15m0-6.11v-.557m0 .556c.92 0 1.667.622 1.667 1.389"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default BriefcaseIcon
