import React from 'react'

const Ethereum: React.FC<React.SVGProps<SVGSVGElement>> = ({ height = 32, width = 32 }) => {
  return (
    <svg height={height} width={width} viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
      <path d="m959.8 80.7-539.7 895.6 539.7-245.3z" fill="#8a92b2" />
      <path d="m959.8 731-539.7 245.3 539.7 319.1z" fill="#62688f" />
      <path d="m1499.6 976.3-539.8-895.6v650.3z" fill="#62688f" />
      <path d="m959.8 1295.4 539.8-319.1-539.8-245.3z" fill="#454a75" />
      <path d="m420.1 1078.7 539.7 760.6v-441.7z" fill="#8a92b2" />
      <path d="m959.8 1397.6v441.7l540.1-760.6z" fill="#62688f" />
    </svg>
  )
}

export default Ethereum
