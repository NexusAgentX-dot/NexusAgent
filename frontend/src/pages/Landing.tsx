import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import AgentRoles from '../components/landing/AgentRoles'
import ProtocolStack from '../components/landing/ProtocolStack'
import WhyXLayer from '../components/landing/WhyXLayer'
import CallToAction from '../components/landing/CallToAction'

export default function Landing() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <AgentRoles />
      <ProtocolStack />
      <WhyXLayer />
      <CallToAction />
    </div>
  )
}
