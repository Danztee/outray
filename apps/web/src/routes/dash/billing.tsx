import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Check } from "lucide-react";

export const Route = createFileRoute("/dash/billing")({
  component: BillingView,
});

function BillingView() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Billing
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your subscription and billing details
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Current Plan</h3>
                <p className="text-sm text-gray-500">
                  You are currently on the Free plan
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-gray-500">/month</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-accent" />
                <span>5 Active Tunnels</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-accent" />
                <span>Unlimited Bandwidth</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-accent" />
                <span>Community Support</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-medium text-white">Payment Method</h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center min-h-50">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-gray-500" />
            </div>
            <h4 className="text-white font-medium mb-1">No payment method</h4>
            <p className="text-sm text-gray-500 mb-6">
              Add a payment method to upgrade your plan
            </p>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/10">
              Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
