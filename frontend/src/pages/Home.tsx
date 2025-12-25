import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Lock, Activity, ArrowRight } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-white">UluCore</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/pricing">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Pricing
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Sign in</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Action Decision Engine
              <br />
              <span className="text-primary">with AI Advisory</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              UluCore helps developers make smart decisions about actions in their
              applications. Deterministic policies + AI recommendations = reliable
              decisions with immutable audit logs.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Core Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Fail-Safe AI
                </h3>
                <p className="text-slate-400">
                  AI recommends, never decides. If AI is unavailable, the system
                  continues operating with policy-based decisions.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Immutable Events
                </h3>
                <p className="text-slate-400">
                  Every decision is logged as an immutable event. No updates, no
                  deletes - complete audit trail guaranteed.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  API-First SaaS
                </h3>
                <p className="text-slate-400">
                  Built for developers. Simple REST API with JWT and API key
                  authentication. Cloud or self-hosted.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Submit Action Request
                  </h3>
                  <p className="text-slate-400">
                    Send a POST request to /action with the action type, resource
                    ID, and user context.
                  </p>
                  <pre className="mt-3 p-4 bg-slate-800 rounded-lg text-sm text-slate-300 overflow-x-auto">
{`curl -X POST /action \\
  -H "X-API-Key: ulc_..." \\
  -d '{"action_type": "delete", "resource_id": "prod-db"}'`}
                  </pre>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Policy Engine Decides
                  </h3>
                  <p className="text-slate-400">
                    The policy engine evaluates your request against configured
                    rules. AI provides recommendations but never makes the final
                    decision.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Get Decision & Audit Log
                  </h3>
                  <p className="text-slate-400">
                    Receive approve/reject decision with reasoning. Every decision
                    is logged immutably for compliance and debugging.
                  </p>
                  <pre className="mt-3 p-4 bg-slate-800 rounded-lg text-sm text-slate-300 overflow-x-auto">
{`{
  "decision": "reject",
  "reason": "Delete operations on production blocked",
  "ai_available": true
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-slate-800/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-slate-400 mb-8">
              Start with our free tier - 100 actions per month, no credit card
              required.
            </p>
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" />
              <span className="text-slate-400">UluCore</span>
            </div>
            <p className="text-sm text-slate-500">
              Action decision engine with AI advisory
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
