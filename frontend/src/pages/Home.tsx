import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  SlidersHorizontal,
  BarChart,
  HeartPulse,
  Landmark,
  Database,
} from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">UluCore</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-teal-300">
              AI-Powered Decision Engine for Critical Actions
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto">
              UluCore combines deterministic rules with AI-driven advice, enabling your organization to automate critical decisions with unparalleled security and full auditability.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2 group">
                  Start Building for Free
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="mailto:contact@ulucore.com">
                <Button size="lg" variant="outline">
                  Request a Demo
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold">The Security You Need, The Intelligence You Want</h2>
              <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                UluCore is built on a foundation of core principles that guarantee safety and reliability.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Fail-Safe AI */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Fail-Safe AI Advisory</h3>
                <p className="text-slate-400">
                  AI provides recommendations, but your rules make the final call. If the AI is unavailable, your system operates seamlessly on deterministic policies, ensuring zero downtime for decision-making.
                </p>
              </div>
              {/* Feature 2: Flexible Policy Engine */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Your Rules, Your Logic</h3>
                <p className="text-slate-400">
                  Implement custom business logic with our powerful and flexible policy engine. Define rules that fit your exact needs, ensuring every automated decision aligns perfectly with your operational requirements.
                </p>
              </div>
              {/* Feature 3: Immutable Logs */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Immutable Audit Logs</h3>
                <p className="text-slate-400">
                  Every single decision is recorded as a tamper-proof event. This creates a complete, unchangeable audit trail, guaranteeing compliance and providing deep insights for debugging and analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold">Simple Integration, Powerful Results</h2>
                <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                    Integrate UluCore into your workflow with a simple, three-step API call.
                </p>
            </div>
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                      <h3 className="text-2xl font-semibold mb-3">1. Submit Action Request</h3>
                      <p className="text-slate-400 mb-4">
                          Send a secure API request detailing the critical action to be taken, such as deleting a production database.
                      </p>
                  </div>
                  <div className="md:w-1/2">
                      <pre className="p-4 bg-slate-800 rounded-lg text-sm text-slate-300 overflow-x-auto w-full">
{`curl -X POST /action \\
  -H "X-API-Key: ulc_..." \\
  -d '{
    "action_type": "delete",
    "resource_id": "prod-db",
    "user_context": {...}
  }'`}
                      </pre>
                  </div>
              </div>
              {/* Step 2 */}
               <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="md:w-1/2">
                      <h3 className="text-2xl font-semibold mb-3">2. AI-Advised Policy Evaluation</h3>
                      <p className="text-slate-400 mb-4">
                          Our engine evaluates your request against your custom rules. The AI provides a risk assessment and recommendation, but the final decision is always yours.
                      </p>
                  </div>
                  <div className="md:w-1/2">
                       <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                          <p className="text-slate-300"><span className="font-bold text-primary">Policy:</span> Block delete operations on 'prod-db'.</p>
                          <p className="text-slate-300 mt-2"><span className="font-bold text-blue-400">AI Advice:</span> High-risk action. Recommend rejection.</p>
                       </div>
                  </div>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                      <h3 className="text-2xl font-semibold mb-3">3. Receive Decision & Immutable Log</h3>
                      <p className="text-slate-400 mb-4">
                          You instantly receive a clear approve/reject decision. The entire event is logged immutably for your records.
                      </p>
                  </div>
                  <div className="md:w-1/2">
                      <pre className="p-4 bg-slate-800 rounded-lg text-sm text-slate-300 overflow-x-auto w-full">
{`{
  "decision": "reject",
  "reason": "Policy Violation: Deletion of production database is forbidden.",
  "ai_recommendation": "reject",
  "event_id": "evt_1a2b3c..."
}`}
                      </pre>
                  </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold">Built for Mission-Critical Systems</h2>
                <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                    UluCore is designed for industries where security and reliability are non-negotiable.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 mx-auto">
                  <HeartPulse className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Healthcare</h3>
                <p className="text-slate-400">
                  Secure patient data access and ensure HIPAA compliance with a verifiable, immutable audit trail for every action.
                </p>
              </div>
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 mx-auto">
                  <Landmark className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Finance & Banking</h3>
                <p className="text-slate-400">
                  Automate transaction approvals, flag high-risk activities with AI insights, and maintain strict regulatory compliance.
                </p>
              </div>
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 mx-auto">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cloud Infrastructure</h3>
                <p className="text-slate-400">
                  Protect critical infrastructure by automating access control and configuration changes with policy-based enforcement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Operations?</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Start building with our free tier or contact us to discuss your enterprise needs. Integrate a smarter, safer decision engine today.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2 group">
                  Get Your API Key
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" />
              <span className="text-slate-400">UluCore</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} UluCore. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
