import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Settings', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text('Manage your account settings and preferences.', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 24),

          _SettingsSection(
            title: 'Account',
            items: [
              _SettingItem(
                icon: Icons.person_outline,
                title: 'Profile Information',
                subtitle: 'Update your name and email',
                onTap: () {},
              ),
              _SettingItem(
                icon: Icons.camera_alt_outlined,
                title: 'Instagram Account',
                subtitle: 'Connected as @johndoe_official',
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('Connected', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.success)),
                ),
                onTap: () => context.push('/dashboard/instagram'),
              ),
            ],
          ),
          const SizedBox(height: 16),

          _SettingsSection(
            title: 'Notifications',
            items: [
              _SettingItem(
                icon: Icons.notifications_outlined,
                title: 'Push Notifications',
                subtitle: 'Receive alerts for new comments',
                trailing: Switch(value: true, onChanged: (v) {}, activeColor: AppColors.primary),
                onTap: () {},
              ),
              _SettingItem(
                icon: Icons.email_outlined,
                title: 'Email Reports',
                subtitle: 'Weekly engagement summary',
                trailing: Switch(value: false, onChanged: (v) {}, activeColor: AppColors.primary),
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          _SettingsSection(
            title: 'Preferences',
            items: [
              _SettingItem(
                icon: Icons.language,
                title: 'Language',
                subtitle: 'English (US)',
                onTap: () {},
              ),
              _SettingItem(
                icon: Icons.currency_exchange,
                title: 'Currency',
                subtitle: 'USD - \$',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          _SettingsSection(
            title: 'Support',
            items: [
              _SettingItem(
                icon: Icons.help_outline,
                title: 'Help Center',
                subtitle: 'Guides and tutorials',
                onTap: () {},
              ),
              _SettingItem(
                icon: Icons.chat_outlined,
                title: 'Contact Support',
                subtitle: 'Get help from our team',
                onTap: () {},
              ),
              _SettingItem(
                icon: Icons.description_outlined,
                title: 'Terms of Service',
                subtitle: 'Read our terms',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Logout Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Sign Out'),
                    content: const Text('Are you sure you want to sign out?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          context.go('/');
                        },
                        child: const Text('Sign Out', style: TextStyle(color: AppColors.error)),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.logout, color: AppColors.error, size: 20),
              label: const Text('Sign Out', style: TextStyle(color: AppColors.error)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Version
          Center(
            child: Text(
              'Comment2DM v1.0.0',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<_SettingItem> items;

  const _SettingsSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          ...items,
        ],
      ),
    );
  }
}

class _SettingItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback onTap;

  const _SettingItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 22, color: AppColors.textSecondary),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 2),
                  Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            trailing ?? const Icon(Icons.chevron_right, size: 20, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}