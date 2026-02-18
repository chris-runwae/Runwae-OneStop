import type { SVGProps } from "react"

const TiktokIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fill={props.fill || "currentColor"}
      d="M16.6 5.82A4.278 4.278 0 0 1 15.1 3h-3.35v12.4a2.592 2.592 0 0 1-2.593 2.55 2.592 2.592 0 0 1-2.593-2.59c0-1.43 1.161-2.59 2.593-2.59.267 0 .524.04.768.116V9.51a6.026 6.026 0 0 0-.768-.049C5.898 9.461 3 12.34 3 15.86 3 19.38 5.898 21 9.157 21c3.259 0 5.907-2.62 5.907-5.86V8.87A7.545 7.545 0 0 0 19.5 10.2V6.84a4.298 4.298 0 0 1-2.9-1.02Z"
    />
  </svg>
)
export default TiktokIcon
