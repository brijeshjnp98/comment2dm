import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class CreateAutomationScreen extends StatefulWidget {
  const CreateAutomationScreen({super.key});

  @override
  State<CreateAutomationScreen> createState() => _CreateAutomationScreenState();
}

class _CreateAutomationScreenState extends State<CreateAutomationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _keywordsController = TextEditingController();
  final _messageController = TextEditingController();
  final _urlController = TextEditingController();
  List<String> _keywords = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _keywordsController.dispose();
    _messageController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  void _addKeyword() {
    final keyword = _keywordsController.text.trim().toLowerCase();
    if (keyword.isNotEmpty && !_keywords.contains(keyword)) {
      setState(() {
        _keywords.add(keyword);
        _keywordsController.clear();
      });
    }
  }

  void _removeKeyword(String keyword) {
    setState(() => _keywords.remove(keyword));
  }

  Future<void> _createAutomation() async {
    if (!_formKey.currentState!.validate()) return;
    if (_keywords.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one keyword')),
      );
      return;
    }

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Automation created successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Create New Automation', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Set up a keyword trigger to automatically send DMs.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 32),

            // Connected Instagram Account
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Instagram Connected', style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppColors.success)),
                        const SizedBox(height: 2),
                        Text('@johndoe_official • Business Account', style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Keywords Section
            Text('Trigger Keywords', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Text('Add keywords that will trigger the automatic DM.', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _keywordsController,
                    decoration: const InputDecoration(
                      hintText: 'e.g., price, book, course',
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onFieldSubmitted: (_) => _addKeyword(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _addKeyword,
                  icon: const Icon(Icons.add),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            if (_keywords.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _keywords.map((keyword) => Chip(
                  label: Text(keyword),
                  deleteIcon: const Icon(Icons.close, size: 16),
                  onDeleted: () => _removeKeyword(keyword),
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                  deleteIconColor: AppColors.primary,
                  labelStyle: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                )).toList(),
              ),
            ],
            const SizedBox(height: 24),

            // DM Message
            Text('DM Reply Message', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Text('This message will be sent automatically.', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 12),
            TextFormField(
              controller: _messageController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Type your automated reply message here...',
                alignLabelWithHint: true,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Please enter a message';
                return null;
              },
            ),
            const SizedBox(height: 12),

            // AI Suggestion Button
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.auto_awesome, size: 18),
              label: const Text('Generate with AI'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
            ),
            const SizedBox(height: 24),

            // Target URL
            Text('Target URL (Optional)', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Text('Link to send with the DM message.', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 12),
            TextFormField(
              controller: _urlController,
              keyboardType: TextInputType.url,
              decoration: const InputDecoration(
                hintText: 'https://yourlink.com/offer',
                prefixIcon: Icon(Icons.link, size: 20),
              ),
            ),
            const SizedBox(height: 32),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _createAutomation,
                child: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Create Automation'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}