import { PricingTable } from '@clerk/clerk-react'

const Pricing = () => {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Upgrade your plan</h1>
        <p className="text-lg text-slate-600">Choose the perfect plan for your collaboration needs.</p>
      </div>
      
      {/* Clerk's pre-built Subscription component */}
      <PricingTable />
    </div>
  )
}

export default Pricing