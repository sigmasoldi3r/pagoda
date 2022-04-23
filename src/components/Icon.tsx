export interface IconProps {
  imgStyle?: React.CSSProperties
  style?: React.CSSProperties
  src?: string
}

// A simple reusable icon component.
export default function Icon({ src, style, imgStyle }: IconProps) {
  return (
    <div className="icon" style={style}>
      &nbsp;
      <img src={src} alt={`${src} Icon`} style={imgStyle} />
    </div>
  )
}
