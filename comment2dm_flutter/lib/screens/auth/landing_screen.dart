import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.bolt, color: Colors.white, size: 24),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Comment2DM',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () => context.push('/login'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                      child: const Text('Get Started'),
                    ),
                  ],
                ),
              ),

              // Hero Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.auto_awesome, size: 16, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text(
                            'AI-Powered Instagram Automation',
                            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Convert Every Comment\nInto a Customer.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Automatically send direct messages with links and info when followers comment on your Instagram posts. Never miss a lead again.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ElevatedButton(
                          onPressed: () => context.push('/signup'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
                            textStyle: const TextStyle(fontSize: 18),
                          ),
                          child: const Row(
                            children: [
                              Text('Start Free Trial'),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_forward, size: 20),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
                            textStyle: const TextStyle(fontSize: 18),
                          ),
                          child: const Text('How it works'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 48),
                    // Brand logos
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _BrandLogo(text: 'INSTA_PRO', icon: Icons.camera_alt),
                        const SizedBox(width: 32),
                        _BrandLogo(text: 'STRIPE', icon: null),
                        const SizedBox(width: 32),
                        _BrandLogo(text: 'META_DEV', icon: null),
                        const SizedBox(width: 32),
                        _BrandLogo(text: 'FIREBASE', icon: null, isPrimary: true),
                      ],
                    ),
                  ],
                ),
              ),

              // Features Section
              Container(
                padding: const EdgeInsets.all(32),
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(48),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 40,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      'Everything you need to scale',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Built for influencers, brands, and agencies.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 48),
                    _FeatureCard(
                      icon: Icons.camera_alt,
                      iconColor: const Color(0xFFE1306C),
                      title: 'Instagram Native',
                      description: 'Direct integration with the Instagram Graph API for lightning fast and secure response delivery.',
                    ),
                    const SizedBox(height: 32),
                    _FeatureCard(
                      icon: Icons.auto_awesome,
                      iconColor: AppColors.primary,
                      title: 'AI DM Generator',
                      description: 'Let our AI write the perfect, non-spammy responses for you. Just enter your goal and keywords.',
                    ),
                    const SizedBox(height: 32),
                    _FeatureCard(
                      icon: Icons.shield_outlined,
                      iconColor: AppColors.accent,
                      title: 'Safe & Compliant',
                      description: 'Built with Meta Developer best practices to ensure your account remains safe and engagement stays high.',
                    ),
                  ],
                ),
              ),

              // Pricing Section
              Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    Text(
                      'Simple, transparent pricing',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Choose the plan that fits your growth.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 32),
                    _PricingCard(
                      title: 'Starter',
                      price: '\$5',
                      features: ['1,000 DMs per month', '3 Active Automations', 'Basic Analytics'],
                      isPopular: false,
                      onTap: () => context.push('/signup'),
                    ),
                    const SizedBox(height: 16),
                    _PricingCard(
                      title: 'Growth',
                      price: '\$10',
                      features: ['2,500 DMs per month', 'Unlimited Automations', 'AI Suggestion Tool', 'Advanced Analytics'],
                      isPopular: true,
                      onTap: () => context.push('/signup'),
                    ),
                    const SizedBox(height: 16),
                    _PricingCard(
                      title: 'Unlimited',
                      price: '\$25',
                      features: ['Unlimited DMs', 'Priority Delivery', 'API Access', 'VIP Support'],
                      isPopular: false,
                      onTap: () => context.push('/signup'),
                    ),
                  ],
                ),
              ),

              // Footer
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: AppColors.border)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.bolt, color: AppColors.primary, size: 24),
                        const SizedBox(width: 8),
                        Text(
                          'Comment2DM',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '© 2024 Comment2DM. All rights reserved.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton(
                          onPressed: () {},
                          child: Text('Privacy', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primary)),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: Text('Terms', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primary)),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: Text('Contact', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.primary)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrandLogo extends StatelessWidget {
  final String text;
  final IconData? icon;
  final bool isPrimary;

  const _BrandLogo({
    required this.text,
    this.icon,
    this.isPrimary = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Icon(icon, size: 18, color: AppColors.textMuted),
          const SizedBox(width: 4),
        ],
        Text(
          text,
          style: TextStyle(
            fontFamily: 'SpaceGrotesk',
            fontWeight: FontWeight.w700,
            fontSize: 14,
            fontStyle: FontStyle.italic,
            color: isPrimary ? AppColors.primary : AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String description;

  const _FeatureCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(icon, color: iconColor, size: 28),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PricingCard extends StatelessWidget {
  final String title;
  final String price;
  final List<String> features;
  final bool isPopular;
  final VoidCallback onTap;

  const _PricingCard({
    required this.title,
    required this.price,
    required this.features,
    required this.isPopular,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isPopular ? AppColors.primary : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: isPopular
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ]
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isPopular)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'MOST POPULAR',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1,
                ),
              ),
            ),
          if (isPopular) const SizedBox(height: 12),
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: isPopular ? Colors.white : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                price,
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  color: isPopular ? Colors.white : AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                '/mo',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: isPopular ? Colors.white.withValues(alpha: 0.8) : AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          ...features.map((feature) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Icon(
                  Icons.check_circle,
                  size: 18,
                  color: isPopular ? Colors.white : AppColors.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  feature,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isPopular ? Colors.white.withValues(alpha: 0.9) : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          )),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: isPopular
                ? ElevatedButton(
                    onPressed: onTap,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Go Pro'),
                  )
                : OutlinedButton(
                    onPressed: onTap,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Get Started'),
                  ),
          ),
        ],
      ),
    );
  }
}