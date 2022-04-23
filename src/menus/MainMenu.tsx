import Button from '../components/Button'
import diskette from '../diskette.png'

function Icon({ src }: { src?: string }) {
  return (
    <div className="icon">
      <img src={src} alt={`${src} Icon`} />
    </div>
  )
}

// Main menu component.
export default function MainMenu() {
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Button>Open a ROM </Button>
      <Button>
        Import a ROM file <Icon src={diskette} />
      </Button>
      <Button>Start a new project</Button>
      <Button>Options</Button>
    </div>
  )
}
