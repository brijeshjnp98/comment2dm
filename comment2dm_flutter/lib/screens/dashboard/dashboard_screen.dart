import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back, John',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Here's what's happening with your automations today.",
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () => context.push('/dashboard/automations/new'),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Create Automation'),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Stats Cards
          Row(
            children: [
              Expanded(child: _StatCard(
                icon: Icons.message,
                iconColor: AppColors.primary,
                label: 'Total DMs Sent',
                value: '1,284',
                trend: '+12.5%',
                trendUp: true,
              )),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(
                icon: Icons.bolt,
                iconColor: AppColors.warning,
                label: 'Active Triggers',
                value: '8',
                subtitle: 'Running across 3 accounts',
              )),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(
                icon: Icons.trending_up,
                iconColor: AppColors.accent,
                label: 'Engagement Rate',
                value: '94.2%',
                trend: '+2.1%',
                trendUp: true,
              )),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(
                icon: Icons.pie_chart,
                iconColor: AppColors.textMuted,
                label: 'Quota Used',
                value: '45%',
                progress: 0.45,
                subtitle: '450 / 1000 DMs',
              )),
            ],
          ),
          const SizedBox(height: 24),

          // Charts and Activity
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Active Automations Card
              Expanded(
                flex: 4,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Active Automations', style: Theme.of(context).textTheme.titleLarge),
                              const SizedBox(height: 4),
                              Text('Manage your running keyword triggers.', style: Theme.of(context).textTheme.bodySmall),
                            ],
                          ),
                          TextButton.icon(
                            onPressed: () => context.push('/dashboard/automations'),
                            icon: const Text('View All'),
                            label: const Icon(Icons.arrow_outward, size: 16),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _AutomationItem(keyword: 'link', sent: 432, isActive: true),
                      const SizedBox(height: 12),
                      _AutomationItem(keyword: 'price', sent: 212, isActive: true),
                      const SizedBox(height: 12),
                      _AutomationItem(keyword: 'details', sent: 156, isActive: false),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Recent Activity Card
              Expanded(
                flex: 3,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Recent Activity', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 4),
                      Text('Latest comments and responses.', style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(height: 16),
                      _ActivityItem(author: 'mikesmith', time: '2m ago', keyword: 'link'),
                      const SizedBox(height: 16),
                      _ActivityItem(author: 'sarah_j', time: '15m ago', keyword: 'price'),
                      const SizedBox(height: 16),
                      _ActivityItem(author: 'alex_travels', time: '1h ago', keyword: 'offer'),
                      const SizedBox(height: 16),
                      _ActivityItem(author: 'dev_guy', time: '3h ago', keyword: 'link'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String? trend;
  final bool trendUp;
  final double? progress;
  final String? subtitle;

  const _StatCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    this.trend,
    this.trendUp = true,
    this.progress,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, size: 20, color: iconColor),
              if (trend != null)
                Text(
                  trend!,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: trendUp ? AppColors.success : AppColors.error,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(value, style: Theme.of(context).textTheme.displaySmall?.copyWith(fontSize: 28)),
          const SizedBox(height: 4),
          if (progress != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: AppColors.background,
                valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 4),
          ],
          Text(
            subtitle ?? label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w500,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _AutomationItem extends StatelessWidget {
  final String keyword;
  final int sent;
  final bool isActive;

  const _AutomationItem({
    required this.keyword,
    required this.sent,
    required this.isActive,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.bolt, size: 16, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Keyword: "$keyword"',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$sent DMs sent total',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isActive ? AppColors.success.withValues(alpha: 0.1) : AppColors.background,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isActive ? 'Active' : 'Inactive',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isActive ? AppColors.success : AppColors.textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final String author;
  final String time;
  final String keyword;

  const _ActivityItem({
    required this.author,
    required this.time,
    required this.keyword,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Stack(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primaryLight,
              child: Text(
                author[0].toUpperCase(),
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
            Positioned(
              bottom: -2,
              right: -2,
              child: Container(
                width: 16,
                height: 16,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle, size: 12, color: AppColors.success),
              ),
            ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              RichText(
                text: TextSpan(
                  style: Theme.of(context).textTheme.bodyMedium,
                  children: [
                    TextSpan(
                      text: '@$author',
                      style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                    ),
                    const TextSpan(text: ' commented '),
                    TextSpan(
                      text: '"$keyword"',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.access_time, size: 12, color: AppColors.textMuted),
                  const SizedBox(width: 4),
                  Text(time, style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(width: 8),
                  Text('DM Sent', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.success)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}