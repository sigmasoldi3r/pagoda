import Button from '../components/Button'
import diskette from '../icons/diskette.png'
import folder from '../icons/folder.png'
import cog from '../icons/cog_wheel.png'
import newPackage from '../icons/new_package.png'
import pagodaLogo from '../logo.png'

function Icon({
  src,
  style,
  imgStyle,
}: {
  imgStyle?: React.CSSProperties
  style?: React.CSSProperties
  src?: string
}) {
  return (
    <div className="icon" style={style}>
      &nbsp;
      <img src={src} alt={`${src} Icon`} style={imgStyle} />
    </div>
  )
}

// Main menu component.
export default function MainMenu() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icon
            imgStyle={{ left: 'calc(-32px + 16px/2 - 1px)' }}
            src={pagodaLogo}
          />
          <h1>Pagoda Engine</h1>
        </div>
        <Button>
          <Icon src={folder} /> &nbsp;Open a ROM
        </Button>
        <Button>
          <Icon src={diskette} /> &nbsp;Import a ROM file
        </Button>
        <Button>
          <Icon src={newPackage} /> &nbsp;Create a new ROM
        </Button>
        <Button>
          <Icon src={cog} /> &nbsp;Options
        </Button>
      </div>
    </div>
  )
}
