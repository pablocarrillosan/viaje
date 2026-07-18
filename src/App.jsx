import { ViajeNavProvider } from './context/ViajeNavContext.jsx'
import { TripProvider } from './context/TripContext.jsx'
import Nav from './components/layout/Nav.jsx'
import Hero from './components/layout/Hero.jsx'
import Map from './components/Map.jsx'
import Timeline from './components/Timeline.jsx'
import Viaje from './components/viaje/Viaje.jsx'
import Top from './components/Top.jsx'
import Material from './components/Material.jsx'
import Footer from './components/layout/Footer.jsx'

export default function App() {
  return (
    <ViajeNavProvider>
      <TripProvider>
        <Nav />
        <main>
          <Hero />
          <Map />
          <Timeline />
          <Viaje />
          <Top />
          <Material />
        </main>
        <Footer />
      </TripProvider>
    </ViajeNavProvider>
  )
}
