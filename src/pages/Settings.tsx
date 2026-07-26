import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket } from 'lucide-react';
import { api } from '../lib/axios';

interface UserUsageResponse {
  currentMonitors: number;
  monitorLimit: number;
}

interface UserSettingsResponse {
  discordWebhookUrl: string | null;
  enableEmailNotifications: boolean;
  slackWebhookUrl: string | null;
  digestEnabled: boolean;
  escalationDelayMinutes: number;
}

interface UpdateSettingsRequest {
  discordWebhookUrl: string;
  enableEmailNotifications: boolean;
  slackWebhookUrl: string;
  digestEnabled: boolean;
  escalationDelayMinutes: number;
}

export const Settings = () => {
  const queryClient = useQueryClient();

  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [escalationDelayMinutes, setEscalationDelayMinutes] = useState(10);

  const { data: usage, isLoading: usageLoading } = useQuery<UserUsageResponse>({
    queryKey: ['userUsage'],
    queryFn: async () => {
      const response = await api.get('/api/users/usage');
      return response.data;
    }
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<UserSettingsResponse>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const response = await api.get('/api/users/settings');
      return response.data;
    }
  });

  useEffect(() => {
    // Seed the editable form fields once the server settings load; setState is intentional.
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiscordWebhookUrl(settings.discordWebhookUrl || '');
      setEnableEmailNotifications(settings.enableEmailNotifications);
      setSlackWebhookUrl(settings.slackWebhookUrl || '');
      setDigestEnabled(settings.digestEnabled);
      setEscalationDelayMinutes(settings.escalationDelayMinutes);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      await api.put('/api/users/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    }
  });

  const handleSave = () => {
    updateSettings.mutate({
      discordWebhookUrl,
      enableEmailNotifications,
      slackWebhookUrl,
      digestEnabled,
      escalationDelayMinutes
    });
  };

  const usagePercentage = usage ? (usage.currentMonitors / usage.monitorLimit) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-semibold text-black mb-8">
        Settings
      </h1>

      <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 mb-8">
        <p className="text-xl font-semibold text-zinc-900 mb-4">
          Plan Usage
        </p>
        {usageLoading ? (
          <p className="text-zinc-500">Loading usage...</p>
        ) : usage ? (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-700">
                {usage.currentMonitors} of {usage.monitorLimit} monitors used
              </span>
              <span className="text-zinc-500">
                {usagePercentage.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={usagePercentage}
              indicatorClassName={usagePercentage >= 100 ? 'bg-red-500' : undefined}
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-xl bg-white border border-zinc-200 shadow-sm p-6 mb-8">
        <p className="text-xl font-semibold text-zinc-900 mb-6">
          Notification Routing
        </p>

        {settingsLoading ? (
          <p className="text-zinc-500">Loading configuration...</p>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-zinc-700 block mb-2 text-sm font-medium">
                Discord Webhook URL
              </label>
              <Input
                placeholder="https://discord.com/api/webhooks/..."
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-zinc-700 block mb-2 text-sm font-medium">
                Slack Webhook URL
              </label>
              <Input
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <div>
                <p className="text-zinc-900">
                  Email Notifications
                </p>
                <p className="text-sm text-zinc-500">
                  Instant emails for security-grade regressions and SSL expiry.
                </p>
              </div>
              <Switch
                checked={enableEmailNotifications}
                onCheckedChange={setEnableEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <div>
                <p className="text-zinc-900">
                  Daily Digest Mode
                </p>
                <p className="text-sm text-zinc-500">
                  Batch email alerts into one daily summary instead of sending them instantly.
                </p>
              </div>
              <Switch
                checked={digestEnabled}
                onCheckedChange={setDigestEnabled}
              />
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <label className="text-zinc-700 block mb-2 text-sm font-medium">
                Escalate to Email After (minutes)
              </label>
              <p className="text-sm text-zinc-500 mb-2">
                If a Down incident isn't acknowledged in this many minutes, an email alert fires as a backup to Discord/Slack.
              </p>
              <Input
                type="number"
                min={1}
                className="max-w-32"
                value={escalationDelayMinutes}
                onChange={(e) => setEscalationDelayMinutes(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-500">
          Maintained by <a href="https://iansebastian.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 transition-colors"><Rocket size={12} /> iansebastian.dev</a>
        </p>
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending || settingsLoading}
        >
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
