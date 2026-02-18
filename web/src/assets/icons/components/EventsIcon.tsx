import type { SVGProps } from "react"

const EventsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <g fill={props.fill || "currentColor"} stroke={props.stroke || "currentColor"} strokeWidth={0.3} clipPath="url(#a)">
      <path d="M14.172 7.695a.706.706 0 0 1 .508 1.164l-.006.009-.001-.001-5.583 5.605-.107.107-.106-.106-2.978-2.978-.008-.008a.706.706 0 0 1 .887-1.072l.109.077.007.006 2.087 2.068 4.697-4.694.007-.008.109-.076a.706.706 0 0 1 .378-.093Z" />
      <path d="M4.039 3.183v1.411H2.373v11.923h15.255V4.594H15.96V3.183h1.959a1.138 1.138 0 0 1 1.119 1.156v12.43l-.004.112a1.143 1.143 0 0 1-.316.7 1.141 1.141 0 0 1-.8.347H2.082A1.142 1.142 0 0 1 .96 16.77V4.34a1.141 1.141 0 0 1 1.12-1.157h1.958Z" />
      <path d="M5.556.96a.706.706 0 0 1 .705.707V5A.706.706 0 1 1 4.85 5V1.667A.706.706 0 0 1 5.556.96ZM14.445.96a.706.706 0 0 1 .705.707V5a.706.706 0 1 1-1.412 0V1.667a.706.706 0 0 1 .707-.706ZM12.927 3.183v1.411H7.072V3.183h5.855Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default EventsIcon
