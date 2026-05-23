import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class BillingScreen extends StatelessWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Billing', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text('Manage your subscription and billing details.', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 24),

          // Current Plan
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 30, offset: const Offset(0, 10)),
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
                        Text('Current Plan', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70)),
                        const SizedBox(height: 4),
                        Text('Growth', style: Theme.of(context).textTheme.displaySmall?.copyWith(color: Colors.white)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      child: Text('\$10/mo', style: Theme.of(context).textTheme.titleSmall?.copyWith(color: Colors.white)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: 0.45,
                    backgroundColor: Colors.white.withValues(alpha: 0.2),
                    valueColor: const AlwaysStoppedAnimation(Colors.white),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(height: 8),
                Text('450 / 2,500 DMs used this month', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70)),
                const SizedBox(height: 24),
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                      child: const Text('Upgrade Plan'),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                      child: const Text('Cancel Subscription'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          Text('Available Plans', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _PlanCard(
                title: 'Starter',
                price: '\$5',
                features: ['1,000 DMs/mo', '3 Automations', 'Basic Analytics'],
                isCurrent: false,
                onSelect: () {},
              )),
              const SizedBox(width: 16),
              Expanded(child: _PlanCard(
                title: 'Growth',
                price: '\$10',
                features: ['2,500 DMs/mo', 'Unlimited Automations', 'AI Suggestions', 'Advanced Analytics'],
                isCurrent: true,
                onSelect: () {},
              )),
              const SizedBox(width: 16),
              Expanded(child: _PlanCard(
                title: 'Unlimited',
                price: '\$25',
                features: ['Unlimited DMs', 'Priority Delivery', 'API Access', 'VIP Support'],
                isCurrent: false,
                onSelect: () {},
              )),
            ],
          ),
          const SizedBox(height: 32),

          // Payment History
          Text('Payment History', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20)],
            ),
            child: Column(
              children: [
                _PaymentHistoryRow(date: 'May 1, 2026', amount: '\$10.00', status: 'Paid'),
                const Divider(height: 1, indent: 20, endIndent: 20),
                _PaymentHistoryRow(date: 'Apr 1, 2026', amount: '\$10.00', status: 'Paid'),
                const Divider(height: 1, indent: 20, endIndent: 20),
                _PaymentHistoryRow(date: 'Mar 1, 2026', amount: '\$10.00', status: 'Paid'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String title;
  final String price;
  final List<String> features;
  final bool isCurrent;
  final VoidCallback onSelect;

  const _PlanCard({
    required this.title, required this.price, required this.features,
    required this.isCurrent, required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isCurrent ? AppColors.primary : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isCurrent ? AppColors.primary : AppColors.border, width: isCurrent ? 2 : 1),
        boxShadow: isCurrent
            ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))]
            : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(color: isCurrent ? Colors.white : AppColors.textPrimary)),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(price, style: Theme.of(context).textTheme.displaySmall?.copyWith(color: isCurrent ? Colors.white : AppColors.textPrimary)),
              Text('/mo', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: isCurrent ? Colors.white70 : AppColors.textSecondary)),
            ],
          ),
          const SizedBox(height: 20),
          ...features.map((f) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Icon(Icons.check, size: 16, color: isCurrent ? Colors.white : AppColors.primary),
                const SizedBox(width: 8),
                Text(f, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: isCurrent ? Colors.white : AppColors.textSecondary)),
              ],
            ),
          )),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: isCurrent
                ? ElevatedButton(
                    onPressed: null,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white24, disabledForegroundColor: Colors.white70),
                    child: const Text('Current Plan'),
                  )
                : OutlinedButton(
                    onPressed: onSelect,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                    ),
                    child: const Text('Switch'),
                  ),
          ),
        ],
      ),
    );
  }
}

class _PaymentHistoryRow extends StatelessWidget {
  final String date;
  final String amount;
  final String status;

  const _PaymentHistoryRow({required this.date, required this.amount, required this.status});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(date, style: Theme.of(context).textTheme.bodyMedium),
          Text(amount, style: Theme.of(context).textTheme.titleSmall),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(status, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.success)),
          ),
        ],
      ),
    );
  }
}