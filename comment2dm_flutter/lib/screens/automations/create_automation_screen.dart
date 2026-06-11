import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../services/instagram_service.dart';

class CreateAutomationScreen extends StatefulWidget {
  final Map<String, dynamic>? selectedPost;

  const CreateAutomationScreen({
    super.key,
    this.selectedPost,
  });

  @override
  State<CreateAutomationScreen> createState() => _CreateAutomationScreenState();
}

class _CreateAutomationScreenState extends State<CreateAutomationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _keywordsController = TextEditingController();
  final _messageController = TextEditingController();
  final _urlController = TextEditingController();
  
  final List<String> _keywords = [];
  bool _isLoading = false;
  bool _isSpecificPost = false;
  Map<String, dynamic>? _selectedPost;
  List<String> _suggestedKeywords = [];

  @override
  void initState() {
    super.initState();
    if (widget.selectedPost != null) {
      _isSpecificPost = true;
      _selectedPost = widget.selectedPost;
      _extractSuggestions();
    }
  }

  @override
  void dispose() {
    _keywordsController.dispose();
    _messageController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  void _extractSuggestions() {
    if (_selectedPost != null && _selectedPost!['caption'] != null) {
      final suggestions = InstagramService.suggestKeywords(_selectedPost!['caption'] as String);
      setState(() {
        // Only suggest keywords that aren't already added
        _suggestedKeywords = suggestions.where((s) => !_keywords.contains(s)).toList();
      });
    } else {
      setState(() {
        _suggestedKeywords = [];
      });
    }
  }

  void _addKeyword(String keyword) {
    final cleanKeyword = keyword.trim().toLowerCase();
    if (cleanKeyword.isNotEmpty && !_keywords.contains(cleanKeyword)) {
      setState(() {
        _keywords.add(cleanKeyword);
        _keywordsController.clear();
        _suggestedKeywords.remove(cleanKeyword);
      });
    }
  }

  void _removeKeyword(String keyword) {
    setState(() {
      _keywords.remove(keyword);
      // Put it back in suggestions if it was in the post suggestions
      if (_selectedPost != null && _selectedPost!['caption'] != null) {
        final suggestions = InstagramService.suggestKeywords(_selectedPost!['caption'] as String);
        if (suggestions.contains(keyword) && !_suggestedKeywords.contains(keyword)) {
          _suggestedKeywords.add(keyword);
        }
      }
    });
  }

  void _showPostSelectorSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: const EdgeInsets.all(24),
          height: MediaQuery.of(context).size.height * 0.75,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Select Instagram Post',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Choose a post to configure keyword trigger automations.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 16),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    childAspectRatio: 1.0,
                  ),
                  itemCount: InstagramService.mockPosts.length,
                  itemBuilder: (context, index) {
                    final post = InstagramService.mockPosts[index];
                    return InkWell(
                      onTap: () {
                        Navigator.pop(context);
                        setState(() {
                          _selectedPost = post;
                        });
                        _extractSuggestions();
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: CachedNetworkImage(
                          imageUrl: post['media_url'] as String,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            color: Colors.grey[200],
                            child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _createAutomation() async {
    if (!_formKey.currentState!.validate()) return;
    if (_keywords.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one keyword')),
      );
      return;
    }
    if (_isSpecificPost && _selectedPost == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a post to target')),
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
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Create New Automation'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Details
                Text('Set Up Trigger Flow', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  'Configure keyword triggers to automate comment replies and send product details via DM.',
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),

                // Connected Instagram Status Indicator
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.success.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: AppColors.success, size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Instagram Business Connected',
                              style: theme.textTheme.titleSmall?.copyWith(color: AppColors.success, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 2),
                            Text('@johndoe_official', style: theme.textTheme.bodySmall),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // TRIGGER SCOPE TARGET SELECTION
                Text('Trigger Scope', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Select whether this automation runs on all posts or a specific media.', style: theme.textTheme.bodySmall),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Center(child: Text('All Posts (Universal)')),
                        selected: !_isSpecificPost,
                        selectedColor: AppColors.primary.withValues(alpha: 0.15),
                        labelStyle: TextStyle(
                          color: !_isSpecificPost ? AppColors.primary : AppColors.textSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                        side: BorderSide(
                          color: !_isSpecificPost ? AppColors.primary : AppColors.border,
                        ),
                        onSelected: (bool selected) {
                          if (selected) {
                            setState(() {
                              _isSpecificPost = false;
                            });
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ChoiceChip(
                        label: const Center(child: Text('Specific Post')),
                        selected: _isSpecificPost,
                        selectedColor: AppColors.primary.withValues(alpha: 0.15),
                        labelStyle: TextStyle(
                          color: _isSpecificPost ? AppColors.primary : AppColors.textSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                        side: BorderSide(
                          color: _isSpecificPost ? AppColors.primary : AppColors.border,
                        ),
                        onSelected: (bool selected) {
                          if (selected) {
                            setState(() {
                              _isSpecificPost = true;
                            });
                            if (_selectedPost == null) {
                              _showPostSelectorSheet();
                            }
                          }
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // SPECIFIC POST DETAILED PREVIEW
                if (_isSpecificPost) ...[
                  if (_selectedPost != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: CachedNetworkImage(
                              imageUrl: _selectedPost!['media_url'] as String,
                              width: 64,
                              height: 64,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Post Caption Preview',
                                  style: theme.textTheme.titleSmall?.copyWith(fontSize: 12),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _selectedPost!['caption'] as String? ?? '',
                                  style: theme.textTheme.bodySmall,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: _showPostSelectorSheet,
                            child: const Text('Change', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    OutlinedButton.icon(
                      onPressed: _showPostSelectorSheet,
                      icon: const Icon(Icons.add_photo_alternate_outlined),
                      label: const Text('Choose Post to Automate'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 54),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                ],

                // Trigger Keywords Section
                Text('Trigger Keywords', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Define the words in comments that will trigger direct messages.', style: theme.textTheme.bodySmall),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _keywordsController,
                        decoration: const InputDecoration(
                          hintText: 'e.g., price, coupon, info',
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        onFieldSubmitted: (val) => _addKeyword(val),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: () => _addKeyword(_keywordsController.text),
                      icon: const Icon(Icons.add),
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
                
                // SMART KEYWORD SUGGESTIONS FROM SELECTED POST
                if (_isSpecificPost && _suggestedKeywords.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Suggestions from post caption:',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: _suggestedKeywords.map((keyword) {
                      return ActionChip(
                        avatar: const Icon(Icons.auto_awesome, size: 12, color: AppColors.primary),
                        label: Text(keyword),
                        onPressed: () => _addKeyword(keyword),
                        backgroundColor: AppColors.primary.withValues(alpha: 0.05),
                        side: const BorderSide(color: AppColors.primaryLight, width: 0.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      );
                    }).toList(),
                  ),
                ],

                // Display Active Keywords
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

                // DM Reply Message
                Text('DM Reply Message', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Write the automated response message to send via Instagram DM.', style: theme.textTheme.bodySmall),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _messageController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText: 'Hey! Here are the details you requested...',
                    alignLabelWithHint: true,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'Please enter a reply message';
                    return null;
                  },
                ),
                const SizedBox(height: 12),

                // AI Suggestion Button
                OutlinedButton.icon(
                  onPressed: () {
                    // Populate with mock AI suggested response
                    if (_keywords.isNotEmpty) {
                      _messageController.text = 'Hey! Thanks for commenting on our post! Here is the info about "${_keywords.first.toUpperCase()}" you requested. Let me know if you need anything else!';
                    } else {
                      _messageController.text = 'Hello! Thank you for your interest! Here is the custom link you requested to get started. Have a wonderful day!';
                    }
                  },
                  icon: const Icon(Icons.auto_awesome, size: 18),
                  label: const Text('Generate Reply with AI'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
                const SizedBox(height: 24),

                // Target URL (Link attachment)
                Text('Target URL (Optional)', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Attach a link that will be sent along with the DM reply.', style: theme.textTheme.bodySmall),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _urlController,
                  keyboardType: TextInputType.url,
                  decoration: const InputDecoration(
                    hintText: 'https://johndoe.com/exclusive-offer',
                    prefixIcon: Icon(Icons.link, size: 20),
                  ),
                ),
                const SizedBox(height: 32),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _createAutomation,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Create Automation'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}