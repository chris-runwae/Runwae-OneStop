import type { SVGProps } from "react"

const UserIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 7c4.42 0 8 1.79 8 4v3H4v-3c0-2.21 3.58-4 8-4Zm0 2c-3.87 0-6 1.5-6 2v1h12v-1c0-.5-2.13-2-6-2Z"
    />
  </svg>
)
export default UserIcon
