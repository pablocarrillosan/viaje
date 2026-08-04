import { ViajeNavProvider } from './context/ViajeNavContext.jsx'
import { TripProvider } from './context/TripContext.jsx'
import { PlazasProvider } from './context/PlazasContext.jsx'
import Nav from './components/layout/Nav.jsx'
import Hero from './components/layout/Hero.jsx'
import Map from './components/Map.jsx'
import Timeline from './components/Timeline.jsx'
import Viaje from './components/viaje/Viaje.jsx'
import MapaViaje from './components/mapaviaje/MapaViaje.jsx'
import Plazas from './components/Plazas.jsx'
import Top from './components/Top.jsx'
import Material from './components/Material.jsx'
import Footer from './components/layout/Footer.jsx'

export default function App() {
  return (
    <ViajeNavProvider>
      <TripProvider>
        <PlazasProvider>
          <Nav />
          <main>
            <Hero />
            <Map />
            <Timeline />
            <Viaje />
            <MapaViaje />
            <Plazas />
            <Top />
            <Material />
          </main>
          <Footer />
        </PlazasProvider>
      </TripProvider>
    </ViajeNavProvider>
  )
}
