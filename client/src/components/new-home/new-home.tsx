import AboutSection from "./AboutSection"
import CardsSection from "./Cards"
import Carrousel from "./Carrousel"
import DisplaySection from "./DisplaySection"
import EmailSubscription from "./EmailSubscription"
import FAQSection from "./FAQSection"
import Footer from "./Footer"
import HeroSection from "./HeroSection"
import Navbar from "./Navbar"
import "./new-home.module.css"

function NewHome() {
  return (
    <div className="new-home">
      <Navbar />
      <HeroSection />
      <DisplaySection />
      <AboutSection />
      <Carrousel />
      <CardsSection />
      <FAQSection />
      <EmailSubscription />
      <Footer />
    </div>
  )
}

export default NewHome
