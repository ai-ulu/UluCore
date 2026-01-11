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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-white">UluCore</span>
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
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Action Decision Engine
              <br />
              <span className="text-primary">with AI Advisory</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              UluCore empowers organizations to make automated, secure, and
              intelligent decisions for any critical action. Deterministic
              policies + AI recommendations = reliable outcomes with immutable
              audit logs.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="mailto:contact@ulucore.com">
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Fail-Safe AI Advisory
                </h3>
                <p className="text-slate-400">
                  Enhance your decisions with AI recommendations. Our fail-safe
                  system ensures that if the AI is unavailable, your operations
                  continue smoothly based on deterministic rules.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Flexible Policy Engine
                </h3>
                <p className="text-slate-400">
                  Define your own rules. The deterministic policy engine allows
                  you to configure custom logic tailored to your specific needs,
                  ensuring predictable and reliable outcomes.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Immutable Audit Logs
                </h3>
                <p className="text-slate-400">
                  Every decision is logged as an immutable event, creating a
                  tamper-proof audit trail. Guarantee compliance and simplify
                  debugging with a complete history of operations.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Metrics & Monitoring
                </h3>
                <p className="text-slate-400">
                  Gain insights into your decision-making process. Track actions,
                  approvals, and rejections with built-in metrics to monitor the
                  health and performance of your system.
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

        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Use Cases Across Industries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 mx-auto">
                  <HeartPulse className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Healthcare
                </h3>
                <p className="text-slate-400">
                  Securely manage patient data access, approve treatment plans,
                  and ensure HIPAA compliance with an immutable audit trail.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 mx-auto">
                  <Landmark className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Finance & Banking
                </h3>
                <p className="text-slate-400">
                  Automate transaction approvals, flag suspicious activities with
                  AI insights, and maintain regulatory compliance.
                </p>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 mx-auto">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Public Sector
                </h3>
                <p className="text-slate-400">
                  Protect sensitive government records, manage access control for
                  critical infrastructure, and ensure data integrity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-slate-800/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Integrate a Smarter Decision Engine
            </h2>
            <p className="text-slate-400 mb-8">
              Secure your critical operations and enhance your workflow with
              UluCore. Get started today or contact us for a personalized demo.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Start Building <ArrowRight className="h-4 w-4" />
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
