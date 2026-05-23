import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class InstagramConnectScreen extends StatefulWidget {
  const InstagramConnectScreen({super.key});

  @override
  State<InstagramConnectScreen> createState() => _InstagramConnectScreenState();
}

class _InstagramConnectScreenState extends State<InstagramConnectScreen> {
  bool _isConnected = false;
  bool _isLoading = false;

  Future<void> _connectInstagram() async {
    setState(() => _isLoading = true);
    // Simulate OAuth flow - will be replaced with actual Instagram OAuth
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isLoading = false;
        _isConnected = true;
      });
    }
  }

  Future<void> _disconnectInstagram() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() {
        _isLoading = false;
        _isConnected = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Back Button
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back),
                ),
              ),
              const Spacer(),
              
              // Main Content
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 30),
                  ],
                ),
                child: Column(
                  children: [
                    // Instagram Logo
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE1306C).withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.camera_alt,
                        size: 40,
                        color: Color(0xFFE1306C),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    if (!_isConnected) ...[
                      Text(
                        'Connect Your Instagram',
                        style: Theme.of(context).textTheme.headlineMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Link your Instagram Business or Creator account to start automating your DMs.',
                        style: Theme.of(context).textTheme.bodyLarge,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      
                      // Requirements
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.warning.withValues(alpha: 0.2)),
                        ),
                        child: Column(
                          children: [
                            _RequirementRow(
                              icon: Icons.check_circle,
                              iconColor: AppColors.success,
                              text: 'Instagram Business or Creator account',
                            ),
                            const SizedBox(height: 8),
                            _RequirementRow(
                              icon: Icons.check_circle,
                              iconColor: AppColors.success,
                              text: 'Facebook Page linked to your Instagram',
                            ),
                            const SizedBox(height: 8),
                            _RequirementRow(
                              icon: Icons.info_outline,
                              iconColor: AppColors.warning,
                              text: 'You can switch back anytime',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      
                      ElevatedButton.icon(
                        onPressed: _isLoading ? null : _connectInstagram,
                        icon: _isLoading
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Icon(Icons.camera_alt, size: 20),
                        label: Text(_isLoading ? 'Connecting...' : 'Connect Instagram'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE1306C),
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        ),
                      ),
                    ] else ...[
                      // Connected State
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.check_circle,
                          size: 40,
                          color: AppColors.success,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Connected Successfully!',
                        style: Theme.of(context).textTheme.headlineMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.camera_alt, size: 18, color: Color(0xFFE1306C)),
                            const SizedBox(width: 8),
                            Text(
                              '@johndoe_official',
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Business Account',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 32),
                      
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _isLoading ? null : _disconnectInstagram,
                              icon: const Icon(Icons.link_off, size: 18),
                              label: const Text('Disconnect'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.error,
                                side: const BorderSide(color: AppColors.error),
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.pop(context);
                              },
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                              child: const Text('Continue to Dashboard'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}

class _RequirementRow extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String text;

  const _RequirementRow({
    required this.icon,
    required this.iconColor,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: iconColor),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text, style: Theme.of(context).textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w500,
          )),
        ),
      ],
    );
  }
}