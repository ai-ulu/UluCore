import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  SlidersHorizontal,
  HeartPulse,
  Landmark,
  Database,
  Check,
  Code,
  BookOpen,
  Users,
  Building2,
  Globe,
  Server,
  FileCheck,
  Clock,
  HeadphonesIcon,
} from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Trust Badges Bar */}
      <div className="bg-slate-950/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>GDPR Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>HIPAA Compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>ISO 27001</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>99.99% Uptime SLA</span>
            </div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">UluCore</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors text-sm">How it Works</a>
              <a href="#industries" className="text-slate-300 hover:text-white transition-colors text-sm">Industries</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors text-sm">Pricing</a>
              <a href="https://docs.ulucore.com" target="_blank" className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Docs
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              <Zap className="h-3 w-3 mr-1" />
              Now with AI-Powered Risk Assessment
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300">
              Secure Critical Decisions with <span className="text-primary">AI Intelligence</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Automate approve/reject decisions with deterministic policies. 
              Get AI-powered risk analysis without compromising on security, compliance, or auditability. 
              Zero downtime. 100% compliance.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link to="/login">
                <Button size="lg" className="gap-2 group text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-primary">10M+</div>
                <div className="text-sm text-slate-400">Decisions Processed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">99.99%</div>
                <div className="text-sm text-slate-400">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-slate-400">Enterprise Customers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - Logos */}
        <section className="py-12 px-4 border-y border-slate-700/50 bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-sm text-slate-500 mb-8">TRUSTED BY INNOVATIVE TEAMS AT</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-lg">
                <Globe className="h-6 w-6" /> TechCorp
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-lg">
                <Building2 className="h-6 w-6" /> FinanceHub
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-lg">
                <Server className="h-6 w-6" /> CloudScale
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-lg">
                <HeartPulse className="h-6 w-6" /> HealthTech
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-lg">
                <Database className="h-6 w-6" /> DataFlow
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Everything You Need for Enterprise Decision Making</h2>
              <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                Built for security-first organizations. UluCore provides the foundation you need to automate decisions at scale.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Fail-Safe AI */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fail-Safe AI Advisory</h3>
                <p className="text-slate-400 text-sm">
                  AI provides recommendations, but your rules make the final call. Zero downtime even when AI is unavailable.
                </p>
              </div>
              {/* Feature 2: Flexible Policy Engine */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Versioned Policy Engine</h3>
                <p className="text-slate-400 text-sm">
                  Create, version, and deploy policies without code changes. Full audit trail of every policy change.
                </p>
              </div>
              {/* Feature 3: Immutable Logs */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Immutable Audit Logs</h3>
                <p className="text-slate-400 text-sm">
                  Tamper-proof event logging. Complete audit trail for SOC2, HIPAA, and GDPR compliance.
                </p>
              </div>
              {/* Feature 4: Idempotency */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Idempotency Support</h3>
                <p className="text-slate-400 text-sm">
                  Prevent duplicate operations with X-Idempotency-Key. Exactly-once processing guaranteed.
                </p>
              </div>
              {/* Feature 5: Multi-Database */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Database Support</h3>
                <p className="text-slate-400 text-sm">
                  PostgreSQL, Supabase, or in-memory. Choose the backend that fits your infrastructure.
                </p>
              </div>
              {/* Feature 6: Enterprise Ready */}
              <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
                <p className="text-slate-400 text-sm">
                  JWT + API Key auth, role-based access, and self-hosted deployment option.
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

        <section id="industries" className="py-20 px-4 bg-slate-800/50">
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

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
              <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                See what our customers say about UluCore
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">
                  "UluCore helped us achieve HIPAA compliance within weeks. The audit trail feature alone was worth the investment."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">JD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">John Doe</div>
                    <div className="text-sm text-slate-400">CTO, HealthTech Inc</div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">
                  "We process millions of transactions through UluCore. The fail-safe AI feature gives us peace of mind."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">AS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Sarah Chen</div>
                    <div className="text-sm text-slate-400">VP Engineering, FinanceHub</div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">
                  "The policy versioning saved us countless hours. Finally, a tool that understands enterprise needs."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">MK</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Mike Kim</div>
                    <div className="text-sm text-slate-400">Security Lead, CloudScale</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs / Why Choose Us */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Choose UluCore?</h2>
              <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
                Built by engineers, for engineers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Developer-First API</h3>
                </div>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> RESTful API with clear documentation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> SDK for Python, Node.js, Go</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Webhooks for real-time events</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Less than 50ms p99 latency</li>
                </ul>
              </div>
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Compliance Built-In</h3>
                </div>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> SOC 2 Type II certified</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> GDPR data processing agreement</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> HIPAA BAA available</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> ISO 27001 compliant infrastructure</li>
                </ul>
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
