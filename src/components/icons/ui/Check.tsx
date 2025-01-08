const Check: React.FC<React.SVGProps<SVGSVGElement>> = ({ height = 32, width = 27, color = 'currentColor' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.9009 3.00486C15.9009 3.2698 15.8082 3.49501 15.6228 3.68047L8.42948 10.8737L7.07825 12.225C6.89279 12.4104 6.66759 12.5032 6.40264 12.5032C6.1377 12.5032 5.91249 12.4104 5.72703 12.225L4.37581 10.8737L0.77917 7.2771C0.593708 7.09164 0.500977 6.86644 0.500977 6.60149C0.500977 6.33655 0.593708 6.11134 0.77917 5.92588L2.13039 4.57466C2.31585 4.3892 2.54106 4.29647 2.806 4.29647C3.07095 4.29647 3.29615 4.3892 3.48162 4.57466L6.40264 7.50562L12.9203 0.978022C13.1058 0.79256 13.331 0.699829 13.5959 0.699829C13.8609 0.699829 14.0861 0.79256 14.2715 0.978022L15.6228 2.32924C15.8082 2.51471 15.9009 2.73991 15.9009 3.00486Z"
        fill={color}
      />
    </svg>
  )
}

export default Check
