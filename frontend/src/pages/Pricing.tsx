import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, PricingPlan } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Check, Zap, Building2 } from 'lucide-react';

export function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getPricingPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load pricing plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Shield className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      case 'enterprise':
        return <Building2 className="h-6 w-6" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };

  const getPrice = (plan: PricingPlan) => {
    if (plan.price_monthly === 0) return 'Free';
    const price = isYearly ? plan.price_yearly / 12 : plan.price_monthly;
    return `$${price.toFixed(0)}`;
  };

  const getActionsText = (limit: number) => {
    if (limit === -1) return 'Unlimited';
    if (limit >= 10000) return `${limit / 1000}K`;
    return limit.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-white">UluCore</span>
            </Link>
            <Link to="/login">
              <Button variant="outline">Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core
            policy engine with fail-safe AI advisory.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <Label htmlFor="billing" className="text-slate-400">
            Monthly
          </Label>
          <Switch
            id="billing"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing" className="text-slate-400">
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          </Label>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.id === 'pro'
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : ''
                }`}
              >
                {plan.id === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        plan.id === 'pro'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {getPlanIcon(plan.id)}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{getPrice(plan)}</span>
                    {plan.price_monthly > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <CardDescription>
                    {getActionsText(plan.actions_limit)} actions/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/login">
                    <Button
                      className="w-full"
                      variant={plan.id === 'pro' ? 'default' : 'outline'}
                    >
                      {plan.id === 'free' ? 'Get Started' : 'Start Free Trial'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Enterprise Features
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Need custom policies, dedicated support, or self-hosted deployment?
            Our enterprise plan has you covered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Custom Policies</h3>
              <p className="text-sm text-slate-400">
                Define complex rules tailored to your business logic
              </p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-semibold text-white mb-2">SLA Guarantee</h3>
              <p className="text-sm text-slate-400">
                99.9% uptime with dedicated support team
              </p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Self-Hosted</h3>
              <p className="text-sm text-slate-400">
                Deploy on your own infrastructure for full control
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-700 mt-16">
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
