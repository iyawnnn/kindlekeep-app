import { useState, useEffect } from 'react';
import { Box, Flex, Text, TextField, Switch, Button, Progress } from '@radix-ui/themes';
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
}

interface UpdateSettingsRequest {
  discordWebhookUrl: string;
  enableEmailNotifications: boolean;
  slackWebhookUrl: string;
  digestEnabled: boolean;
}

export const Settings = () => {
  const queryClient = useQueryClient();
  
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [digestEnabled, setDigestEnabled] = useState(false);

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
      digestEnabled
    });
  };

  const usagePercentage = usage ? (usage.currentMonitors / usage.monitorLimit) * 100 : 0;

  return (
    <Box className="max-w-3xl mx-auto py-10 px-6 font-onest">
      <Text className="font-unbounded font-bold text-3xl text-black block mb-8">
        Settings
      </Text>

      <Box className="bg-white border border-zinc-200 shadow-sm p-6 mb-8" style={{ borderRadius: 0 }}>
        <Text className="font-unbounded font-bold text-xl text-zinc-900 block mb-4">
          Budget Shield
        </Text>
        {usageLoading ? (
          <Text className="text-zinc-500 font-onest">Evaluating quotas...</Text>
        ) : usage ? (
          <Box>
            <Flex justify="between" mb="2">
              <Text className="text-zinc-700 font-onest">
                {usage.currentMonitors} of {usage.monitorLimit} monitors utilized
              </Text>
              <Text className="text-zinc-500 font-onest">
                {usagePercentage.toFixed(0)}%
              </Text>
            </Flex>
            <Progress
              value={usagePercentage}
              className="h-2 bg-zinc-200"
              style={{ borderRadius: 0 }}
              color={usagePercentage >= 100 ? "red" : "blue"}
            />
          </Box>
        ) : null}
      </Box>

      <Box className="bg-white border border-zinc-200 shadow-sm p-6 mb-8" style={{ borderRadius: 0 }}>
        <Text className="font-unbounded font-bold text-xl text-zinc-900 block mb-6">
          Notification Routing
        </Text>

        {settingsLoading ? (
          <Text className="text-zinc-500 font-onest">Loading configuration...</Text>
        ) : (
          <Flex direction="column" gap="5">
            <Box>
              <Text className="text-zinc-700 font-onest block mb-2">
                Discord Webhook URL
              </Text>
              <TextField.Root
                placeholder="https://discord.com/api/webhooks/..."
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                className="font-onest bg-white border-zinc-300 text-zinc-900"
                style={{ borderRadius: 0 }}
              />
            </Box>

            <Box>
              <Text className="text-zinc-700 font-onest block mb-2">
                Slack Webhook URL
              </Text>
              <TextField.Root
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                className="font-onest bg-white border-zinc-300 text-zinc-900"
                style={{ borderRadius: 0 }}
              />
            </Box>

            <Flex align="center" justify="between" className="pt-4 border-t border-zinc-200">
              <Box>
                <Text className="text-zinc-900 font-onest block">
                  Email Notifications
                </Text>
                <Text size="2" className="text-zinc-500 font-onest">
                  Instant emails for security-grade regressions and SSL expiry.
                </Text>
              </Box>
              <Switch
                checked={enableEmailNotifications}
                onCheckedChange={setEnableEmailNotifications}
                color="blue"
              />
            </Flex>

            <Flex align="center" justify="between" className="pt-4 border-t border-zinc-200">
              <Box>
                <Text className="text-zinc-900 font-onest block">
                  Daily Digest Mode
                </Text>
                <Text size="2" className="text-zinc-500 font-onest">
                  Batch email alerts into one daily summary instead of sending them instantly.
                </Text>
              </Box>
              <Switch
                checked={digestEnabled}
                onCheckedChange={setDigestEnabled}
                color="blue"
              />
            </Flex>
          </Flex>
        )}
      </Box>

      <Flex justify="between" align="center">
         <Text size="2" className="text-zinc-500 font-onest">
           Maintained by <a href="https://iansebastian.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 transition-colors"><Rocket size={12} /> iansebastian.dev</a>
         </Text>
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending || settingsLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-onest cursor-pointer px-6 transition-colors duration-150"
          style={{ borderRadius: 0 }}
        >
          {updateSettings.isPending ? 'Synchronizing...' : 'Save Configuration'}
        </Button>
      </Flex>
    </Box>
  );
};