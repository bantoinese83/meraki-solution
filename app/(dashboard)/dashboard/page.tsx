'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Info, AlertCircle, FilePlus, UserPlus, ReceiptText, Clock } from 'lucide-react';
import { AuroraText } from '@/components/magicui/aurora-text';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { BoxReveal } from '@/components/magicui/box-reveal';
import { FlipText } from '@/components/magicui/flip-text';
import { Meteors } from '@/components/magicui/meteors';
import { NumberTicker } from '@/components/magicui/number-ticker';
import dynamic from 'next/dynamic';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">Current Plan: {teamData?.planName || 'Free'}</p>
              <p className="text-sm text-muted-foreground">
                {teamData?.subscriptionStatus === 'active'
                  ? 'Billed monthly'
                  : teamData?.subscriptionStatus === 'trialing'
                    ? 'Trial period'
                    : 'No active subscription'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Subscription
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<ActionState, FormData>(
    removeTeamMember,
    {},
  );

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 relative overflow-hidden">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  {/* 
                    This app doesn't save profile images, but here
                    is how you'd show them:

                    <AvatarImage
                      src={member.user.image || ''}
                      alt={getUserDisplayName(member.user)}
                    />
                  */}
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{getUserDisplayName(member.user)}</p>
                  <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button type="submit" variant="outline" size="sm" disabled={isRemovePending}>
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && <p className="text-red-500 mt-4">{removeState.error}</p>}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<ActionState, FormData>(
    inviteTeamMember,
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>Role</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && <p className="text-red-500">{inviteState.error}</p>}
          {inviteState?.success && <p className="text-green-500">{inviteState.success}</p>}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You must be a team owner to invite new members.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats = {} } = useSWR('/api/analytics', (url) => fetch(url).then((r) => r.json()));
  const { data: ai = { insights: [] } } = useSWR('/api/ai-insights', (url) =>
    fetch(url).then((r) => r.json()),
  );
  // Calculate derived metrics
  const totalExpenses = stats.totalExpenses || 0;
  const netProfit = (stats.totalRevenue || 0) - totalExpenses;
  const totalHours = stats.totalHours || 0;
  const avgInvoice = stats.paidCount ? (stats.totalRevenue || 0) / stats.paidCount : 0;
  const recentActivity = stats.recentActivity || [];
  const paidRate = stats.paidCount && stats.unpaidCount ? stats.paidCount / (stats.paidCount + stats.unpaidCount) : 0;
  const expenseRatio = stats.totalRevenue ? totalExpenses / stats.totalRevenue : 0;
  // Example monthly data (replace with stats.monthlyRevenue/monthlyExpenses if available)
  const monthlyData = stats.monthlyRevenue && stats.monthlyExpenses ?
    stats.monthlyRevenue.map((rev: number, i: number) => ({
      month: stats.monthLabels[i],
      Revenue: rev / 100,
      Expenses: stats.monthlyExpenses[i] / 100,
    })) : [
      { month: 'Jan', Revenue: 1200, Expenses: 800 },
      { month: 'Feb', Revenue: 1500, Expenses: 900 },
      { month: 'Mar', Revenue: 1700, Expenses: 1100 },
      { month: 'Apr', Revenue: 1400, Expenses: 950 },
      { month: 'May', Revenue: 1800, Expenses: 1200 },
      { month: 'Jun', Revenue: 2000, Expenses: 1300 },
    ];
  // Drill-down modal state
  const [drilldown, setDrilldown] = useState<{ month: string; data: any } | null>(null);
  // Pie chart data for revenue breakdown by top clients
  const pieData = (stats.topClients || []).map((c: any) => ({ name: c.name, value: c.total / 100 }));
  const pieColors = ['#fb923c', '#f472b6', '#fbbf24', '#a78bfa', '#34d399'];
  // Defensive: ensure ai.insights is always an array
  const insights = Array.isArray(ai.insights) ? ai.insights : [];
  return (
    <div className="space-y-10">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
        <AuroraText>Meraki Dashboard</AuroraText>
      </h1>
      <div className="mb-8 bg-orange-50 rounded-xl p-6 shadow flex items-center gap-4">
        <Info className="w-8 h-8 text-orange-400 flex-shrink-0" />
        <div>
          <div className="text-lg font-semibold text-orange-700 mb-1">Your Business Command Center</div>
          <div className="text-gray-700">
            Get a real-time overview of your revenue, expenses, clients, and team. Dive into analytics, track trends, and manage your business with confidence—all in one place.
          </div>
        </div>
      </div>
      <SparklesText className="text-xl md:text-2xl mb-6">Welcome back! Your business is shining bright ✨</SparklesText>
      <BoxReveal boxColor="#fb923c" duration={0.7}>
        <h2 className="text-2xl font-bold mt-8 mb-4">Your Business At a Glance</h2>
      </BoxReveal>
      {/* Quick Actions Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-evenly gap-4 py-6 w-full">
            <Button className="btn-meraki flex items-center gap-2 px-5 py-3 text-base font-semibold shadow-md" onClick={() => window.location.href = '/dashboard/invoices'}>
              <FilePlus className="w-5 h-5" /> Add Invoice
            </Button>
            <Button className="btn-meraki flex items-center gap-2 px-5 py-3 text-base font-semibold shadow-md" onClick={() => window.location.href = '/dashboard/clients'}>
              <UserPlus className="w-5 h-5" /> Add Client
            </Button>
            <Button className="btn-meraki flex items-center gap-2 px-5 py-3 text-base font-semibold shadow-md" onClick={() => window.location.href = '/dashboard/expenses'}>
              <ReceiptText className="w-5 h-5" /> Add Expense
            </Button>
            <Button className="btn-meraki flex items-center gap-2 px-5 py-3 text-base font-semibold shadow-md" onClick={() => window.location.href = '/dashboard/time-tracking'}>
              <Clock className="w-5 h-5" /> Add Time Entry
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
          <NumberTicker value={stats.totalRevenue ? stats.totalRevenue / 100 : 0} decimalPlaces={2} className="text-3xl font-bold text-orange-600" />
          <span className="text-gray-500 mt-2">Total Revenue</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
          <NumberTicker value={stats.activeClients || 0} className="text-3xl font-bold text-orange-600" />
          <span className="text-gray-500 mt-2">Active Clients</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
          <NumberTicker value={totalExpenses / 100} decimalPlaces={2} className="text-3xl font-bold text-orange-600" />
          <span className="text-gray-500 mt-2">Total Expenses</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
          <NumberTicker value={netProfit / 100} decimalPlaces={2} className="text-3xl font-bold text-orange-600" />
          <span className="text-gray-500 mt-2">Net Profit</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-center mt-6">
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
          <NumberTicker value={totalHours} decimalPlaces={1} className="text-3xl font-bold text-orange-600" />
          <span className="text-gray-500 mt-2">Total Hours Tracked</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
          <NumberTicker value={avgInvoice / 100} decimalPlaces={2} className="text-3xl font-bold text-orange-600" />
          <span className="text-gray-500 mt-2">Avg. Invoice Value</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden min-h-[120px]">
          <span className="text-lg font-bold text-orange-700 mb-2">Recent Activity</span>
          <ul className="text-sm text-gray-700 w-full">
            {recentActivity.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-6">
                <AlertCircle className="h-8 w-8 text-orange-400 mb-2" />
                <span className="text-gray-400">No recent activity.</span>
              </li>
            ) : (
              recentActivity.slice(0, 5).map((a: any, i: number) => (
                <li key={i} className="mb-1">{a}</li>
              ))
            )}
          </ul>
        </div>
      </div>
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
            <span className="font-semibold mb-2 text-orange-700">Paid Invoice Rate</span>
            <div className="w-32 h-32">
              <CircularProgressbar
                value={paidRate * 100}
                text={`${Math.round(paidRate * 100)}%`}
                styles={buildStyles({
                  pathColor: '#fb923c',
                  textColor: '#fb923c',
                  trailColor: '#ffe4b5',
                  backgroundColor: '#fff7ed',
                })}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
            <span className="font-semibold mb-2 text-orange-700">Expense Ratio</span>
            <div className="w-32 h-32">
              <CircularProgressbar
                value={expenseRatio * 100}
                text={`${Math.round(expenseRatio * 100)}%`}
                styles={buildStyles({
                  pathColor: '#f472b6',
                  textColor: '#f472b6',
                  trailColor: '#ffe4b5',
                  backgroundColor: '#fff7ed',
                })}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
            <span className="font-semibold mb-2 text-orange-700">Revenue vs Expenses</span>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} onClick={(data) => {
                  if (data && data.activeLabel) {
                    setDrilldown({ month: data.activeLabel, data });
                  }
                }}>
                  <XAxis dataKey="month" stroke="#fb923c" />
                  <YAxis stroke="#fb923c" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Revenue" fill="#fb923c" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#f472b6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold">
              ${(stats.totalRevenue / 100).toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500">Outstanding</div>
            <div className="text-2xl font-bold">
              ${(stats.outstanding / 100).toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500">Paid Invoices</div>
            <div className="text-2xl font-bold">{stats.paidCount || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500">Unpaid Invoices</div>
            <div className="text-2xl font-bold">{stats.unpaidCount || 0}</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-2">Top Clients</div>
            <ul>
              {(stats.topClients || []).map((c: unknown) => {
                const client = c as { id: number; name: string; total: number };
                return (
                  <li key={client.id}>
                    {client.name} (${(client.total / 100).toFixed(2)})
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-2">AI Insights</div>
            <ul className="list-disc pl-5">
              {insights.length === 0 ? (
                <li className="flex items-center gap-2 text-gray-400">
                  <AlertCircle className="h-4 w-4" />
                  No insights yet.
                </li>
              ) : (
                insights.map((insight: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    {insight}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Revenue & Expenses Trend Line Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
            <span className="font-semibold mb-2 text-orange-700">Revenue & Expenses Trend</span>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#fb923c" />
                  <YAxis stroke="#fb923c" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Revenue" stroke="#fb923c" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Expenses" stroke="#f472b6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Revenue Breakdown Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative overflow-hidden">
            <span className="font-semibold mb-2 text-orange-700">Revenue Breakdown (Top Clients)</span>
            <div className="w-full h-64 flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="text-gray-400 text-center">No paid invoices or top clients yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        {/* Drill-down Modal (mocked) */}
        {drilldown && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full relative">
              <button className="absolute top-2 right-2 text-orange-500 text-2xl" onClick={() => setDrilldown(null)}>&times;</button>
              <h2 className="text-2xl font-bold mb-4">Details for {drilldown.month}</h2>
              <div className="mb-2 font-semibold">Invoices</div>
              <ul className="mb-4">
                <li>Invoice #1234 — $1,200.00</li>
                <li>Invoice #1235 — $800.00</li>
              </ul>
              <div className="mb-2 font-semibold">Expenses</div>
              <ul>
                <li>Expense: Software — $300.00</li>
                <li>Expense: Marketing — $500.00</li>
              </ul>
            </div>
          </div>
        )}
      </section>
      <div className="mt-10 text-center text-gray-500 text-sm">
        Need help with your dashboard or want to unlock more analytics?{' '}
        <a href="mailto:support@meraki.com" className="text-orange-500 hover:underline">Contact Support</a>
      </div>
    </div>
  );
}