import type { SVGProps } from "react"

const EmailIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 2v.01L12 13 4 6.01V6h16ZM4 18V8.37l7.47 6.5c.32.28.8.28 1.13-.01L20 8.37V18H4Z"
    />
  </svg>
)
export default EmailIcon
