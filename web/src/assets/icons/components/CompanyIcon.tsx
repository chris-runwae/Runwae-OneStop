import type { SVGProps } from "react"

const CompanyIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M18 15h-2v2h2v-2Zm0-4h-2v2h2v-2Zm2 8h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10ZM10 7H8V5h2v2Zm0 4H8V9h2v2Zm0 4H8v-2h2v2Zm0 4H8v-2h2v2Zm-4-8H4V9h2v2Zm0 4H4v-2h2v2Zm0 4H4v-2h2v2Zm0-12H4V5h2v2ZM14 7V3H2v18h20V7H14Z"
    />
  </svg>
)
export default CompanyIcon
