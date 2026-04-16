import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Sliders, 
  Users,
  Save,
  CheckCircle
} from 'lucide-react';

export function Settings() {
  const [healthScoreWeights, setHealthScoreWeights] = useState({
    product_usage: 25,
    support_tickets: 20,
    billing_health: 20,
    engagement_level: 20,
    renewal_proximity: 15,
  });

  const [notifications, setNotifications] = useState({
    email_renewal_reminders: true,
    email_health_alerts: true,
    email_escalations: true,
    in_app_renewal_reminders: true,
    in_app_health_alerts: true,
    in_app_escalations: true,
    daily_digest: false,
    weekly_report: true,
  });

  const totalWeight = Object.values(healthScoreWeights).reduce((a, b) => a + b, 0);
  const isWeightValid = totalWeight === 100;

  return (
    <div className="h-full flex flex-col">
      <Header
        title="Settings"
        subtitle="Configure your CS Command Center"
      />

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="profile" className="max-w-4xl">
          <TabsList className="bg-white border mb-6">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="health">
              <Sliders className="h-4 w-4 mr-2" />
              Health Score
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="Sarah" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Johnson" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="sarah.johnson@cscommand.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+1-555-0101" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input defaultValue="America/New_York" />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
                <Button variant="outline">Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Score Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Score Configuration</CardTitle>
                <CardDescription>
                  Customize how health scores are calculated. Weights must total 100%.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Weight</span>
                  <div className="flex items-center gap-3">
                    <span className={cn('text-lg font-bold', isWeightValid ? 'text-emerald-600' : 'text-red-600')}>
                      {totalWeight}%
                    </span>
                    {isWeightValid && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Product Usage ({healthScoreWeights.product_usage}%)</Label>
                    </div>
                    <Slider
                      value={[healthScoreWeights.product_usage]}
                      onValueChange={(value) => setHealthScoreWeights({ ...healthScoreWeights, product_usage: value[0] })}
                      max={100}
                      step={5}
                    />
                    <p className="text-sm text-gray-500">Measures how actively customers use your product</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Support Tickets ({healthScoreWeights.support_tickets}%)</Label>
                    </div>
                    <Slider
                      value={[healthScoreWeights.support_tickets]}
                      onValueChange={(value) => setHealthScoreWeights({ ...healthScoreWeights, support_tickets: value[0] })}
                      max={100}
                      step={5}
                    />
                    <p className="text-sm text-gray-500">Factors in volume and severity of support requests</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Billing Health ({healthScoreWeights.billing_health}%)</Label>
                    </div>
                    <Slider
                      value={[healthScoreWeights.billing_health]}
                      onValueChange={(value) => setHealthScoreWeights({ ...healthScoreWeights, billing_health: value[0] })}
                      max={100}
                      step={5}
                    />
                    <p className="text-sm text-gray-500">Considers payment history and billing disputes</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Engagement Level ({healthScoreWeights.engagement_level}%)</Label>
                    </div>
                    <Slider
                      value={[healthScoreWeights.engagement_level]}
                      onValueChange={(value) => setHealthScoreWeights({ ...healthScoreWeights, engagement_level: value[0] })}
                      max={100}
                      step={5}
                    />
                    <p className="text-sm text-gray-500">Tracks communication frequency and meeting attendance</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Renewal Proximity ({healthScoreWeights.renewal_proximity}%)</Label>
                    </div>
                    <Slider
                      value={[healthScoreWeights.renewal_proximity]}
                      onValueChange={(value) => setHealthScoreWeights({ ...healthScoreWeights, renewal_proximity: value[0] })}
                      max={100}
                      step={5}
                    />
                    <p className="text-sm text-gray-500">Adjusts score based on time until renewal</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!isWeightValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Score Thresholds</CardTitle>
                <CardDescription>Define score ranges for health status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                      <span className="font-medium">Green (Healthy)</span>
                    </div>
                    <span className="text-emerald-700 font-semibold">70-100 points</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-amber-500 rounded-full" />
                      <span className="font-medium">Yellow (At Risk)</span>
                    </div>
                    <span className="text-amber-700 font-semibold">40-69 points</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full" />
                      <span className="font-medium">Red (Critical)</span>
                    </div>
                    <span className="text-red-700 font-semibold">0-39 points</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure which emails you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Renewal Reminders</p>
                    <p className="text-sm text-gray-500">Get notified about upcoming renewals</p>
                  </div>
                  <Switch
                    checked={notifications.email_renewal_reminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_renewal_reminders: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Health Score Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when account health drops</p>
                  </div>
                  <Switch
                    checked={notifications.email_health_alerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_health_alerts: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Escalation Notifications</p>
                    <p className="text-sm text-gray-500">Get notified about new escalations</p>
                  </div>
                  <Switch
                    checked={notifications.email_escalations}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_escalations: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>In-App Notifications</CardTitle>
                <CardDescription>Configure in-app alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Renewal Reminders</p>
                    <p className="text-sm text-gray-500">Show renewal alerts in the app</p>
                  </div>
                  <Switch
                    checked={notifications.in_app_renewal_reminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, in_app_renewal_reminders: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Health Score Alerts</p>
                    <p className="text-sm text-gray-500">Show health alerts in the app</p>
                  </div>
                  <Switch
                    checked={notifications.in_app_health_alerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, in_app_health_alerts: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Escalation Notifications</p>
                    <p className="text-sm text-gray-500">Show escalation alerts in the app</p>
                  </div>
                  <Switch
                    checked={notifications.in_app_escalations}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, in_app_escalations: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Digest Emails</CardTitle>
                <CardDescription>Receive summary emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Digest</p>
                    <p className="text-sm text-gray-500">Get a daily summary of activities</p>
                  </div>
                  <Switch
                    checked={notifications.daily_digest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, daily_digest: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Report</p>
                    <p className="text-sm text-gray-500">Get a weekly performance summary</p>
                  </div>
                  <Switch
                    checked={notifications.weekly_report}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weekly_report: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your CS team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Johnson', email: 'sarah.johnson@cscommand.com', role: 'Admin', status: 'Active' },
                    { name: 'Mike Chen', email: 'mike.chen@cscommand.com', role: 'CSM', status: 'Active' },
                    { name: 'Emma Davis', email: 'emma.davis@cscommand.com', role: 'CSM', status: 'Active' },
                    { name: 'James Wilson', email: 'james.wilson@cscommand.com', role: 'CS Ops', status: 'Active' },
                  ].map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{member.role}</Badge>
                        <Badge className="bg-emerald-100 text-emerald-700">{member.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Team Member
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
