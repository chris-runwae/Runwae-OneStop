import type { SVGProps } from "react"

const LogoutIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke={props.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.667 6.667V5A1.667 1.667 0 0 0 10 3.333H4.167A1.667 1.667 0 0 0 2.5 5v10a1.667 1.667 0 0 0 1.667 1.667H10A1.666 1.666 0 0 0 11.667 15v-1.667M7.5 10h10m0 0L15 7.5m2.5 2.5L15 12.5"
    />
  </svg>
)
export default LogoutIcon
