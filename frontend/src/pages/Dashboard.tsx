import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api, Event, Metrics, APIKey } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Shield,
  Activity,
  Key,
  LogOut,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, metricsData, keysData] = await Promise.all([
        api.getEvents(),
        api.getMetrics(),
        api.getAPIKeys(),
      ]);
      setEvents(eventsData);
      setMetrics(metricsData);
      setApiKeys(keysData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const key = await api.createAPIKey(newKeyName);
      setNewKey(key.key || null);
      setApiKeys([...apiKeys, key]);
      setNewKeyName('');
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await api.deleteAPIKey(id);
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">UluCore</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Actions</CardDescription>
              <CardTitle className="text-3xl">
                {metrics?.total_actions ?? '-'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {metrics?.approved_count ?? '-'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {metrics?.rejected_count ?? '-'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Reject Rate</CardDescription>
              <CardTitle className="text-3xl">
                {metrics ? `${(metrics.reject_rate * 100).toFixed(1)}%` : '-'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events" className="gap-2">
              <Activity className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  Immutable record of all action decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading...
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events yet. Use the API to submit actions.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Decision</TableHead>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>AI</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Badge
                              variant={
                                event.decision === 'approve'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className="gap-1"
                            >
                              {event.decision === 'approve' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {event.decision}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {event.action_type}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {event.resource_id}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {event.reason}
                          </TableCell>
                          <TableCell>
                            {event.ai_available ? (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <AlertCircle className="h-3 w-3 text-yellow-500" />
                                Unavailable
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(event.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage your API keys for accessing UluCore
                    </CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                          Give your API key a name to identify it later.
                        </DialogDescription>
                      </DialogHeader>
                      {newKey ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 mb-2">
                              Your API key has been created. Copy it now - you
                              won't be able to see it again!
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 p-2 bg-white rounded border text-sm break-all">
                                {newKey}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(newKey)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => {
                              setNewKey(null);
                              setDialogOpen(false);
                            }}
                          >
                            Done
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Input
                            placeholder="Key name (e.g., Production API)"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                          />
                          <Button
                            className="w-full"
                            onClick={handleCreateKey}
                            disabled={isCreatingKey || !newKeyName.trim()}
                          >
                            {isCreatingKey ? 'Creating...' : 'Create Key'}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No API keys yet. Create one to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className="font-medium">
                            {key.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {key.key_prefix}...
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(key.created_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKey(key.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
