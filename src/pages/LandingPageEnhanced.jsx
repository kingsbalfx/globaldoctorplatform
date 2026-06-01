import LandingPage from './LandingPage'
import PlatformExplainer from '../components/PlatformExplainer'
import HumanoidAssistant from '../components/ai/HumanoidAssistant'

function LandingPageEnhanced() {
  return (
    <>
      <LandingPage />
      <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
        <PlatformExplainer />
      </div>
      <HumanoidAssistant portal="landing" />
    </>
  )
}

export default LandingPageEnhanced
