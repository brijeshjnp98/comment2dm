import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../services/instagram_service.dart';

class InstagramConnectScreen extends StatefulWidget {
  const InstagramConnectScreen({super.key});

  @override
  State<InstagramConnectScreen> createState() => _InstagramConnectScreenState();
}

class _InstagramConnectScreenState extends State<InstagramConnectScreen> {
  bool _isConnected = false;
  bool _isLoading = false;
  bool _loadingPosts = false;
  String _activeTab = 'grid'; // 'grid' or 'feed'
  List<Map<String, dynamic>> _posts = [];
  final InstagramService _instagramService = InstagramService();

  @override
  void initState() {
    super.initState();
    // In a real app we'd check if the user is already connected in Firestore
  }

  Future<void> _connectInstagram() async {
    setState(() {
      _isLoading = true;
    });

    // Simulate network delay for token exchange
    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      setState(() {
        _isLoading = false;
        _isConnected = true;
      });
      _loadPosts();
    }
  }

  Future<void> _disconnectInstagram() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 800));
    if (mounted) {
      setState(() {
        _isLoading = false;
        _isConnected = false;
        _posts = [];
      });
    }
  }

  Future<void> _loadPosts() async {
    setState(() => _loadingPosts = true);
    try {
      final postsList = await _instagramService.getRecentMedia('me', 'mock_token');
      if (mounted) {
        setState(() {
          _posts = postsList;
        });
      }
    } catch (_) {}
    if (mounted) {
      setState(() => _loadingPosts = false);
    }
  }

  void _showPermissionSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(28),
              topRight: Radius.circular(28),
            ),
          ),
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 16,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2.5),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.facebook, color: Color(0xFF1877F2), size: 36),
                  const SizedBox(width: 8),
                  Text(
                    'Meta Account Center',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: const Color(0xFF1877F2),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 16),
              Text(
                'Connect Comment2DM to Instagram',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Comment2DM needs permission to access your Instagram Business account in order to monitor comments and send direct messages.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              
              _PermissionScopeRow(
                icon: Icons.account_circle_outlined,
                title: 'Access profile info & handle',
                description: 'Access username, profile photo, and business data for @johndoe_official.',
              ),
              const SizedBox(height: 16),
              _PermissionScopeRow(
                icon: Icons.photo_library_outlined,
                title: 'Access posts, reels & media',
                description: 'Fetch post images, videos, captions, and comments metrics.',
              ),
              const SizedBox(height: 16),
              _PermissionScopeRow(
                icon: Icons.question_answer_outlined,
                title: 'Manage DMs & replies',
                description: 'Send automated replies to post comments and trigger direct messages.',
              ),
              
              const SizedBox(height: 28),
              const Divider(),
              const SizedBox(height: 16),
              Text(
                'By tapping Allow Access, you authorize Comment2DM to access these scopes. You can disconnect or revoke permissions at any time.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontSize: 11,
                  color: AppColors.textMuted,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text('Decline'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _connectInstagram();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1877F2),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                      ),
                      child: const Text('Allow Access'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  void _navigateToCreateAutomation(Map<String, dynamic> post) {
    context.push('/dashboard/automations/new', extra: {'post': post});
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Instagram Integration',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            
            Expanded(
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      if (!_isConnected) ...[
                        // Connection Prompt Card
                        _buildConnectionPromptCard(theme),
                      ] else ...[
                        // Connected Account Overview & Profile
                        _buildConnectedProfileCard(theme),
                        const SizedBox(height: 24),
                        
                        // Recent Posts Section Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Your Recent Posts',
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Select a post to set up automation replies.',
                                  style: theme.textTheme.bodySmall,
                                ),
                              ],
                            ),
                            
                            // Tab view icons
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Row(
                                children: [
                                  IconButton(
                                    icon: Icon(
                                      Icons.grid_on,
                                      size: 18,
                                      color: _activeTab == 'grid' ? AppColors.primary : AppColors.textMuted,
                                    ),
                                    onPressed: () => setState(() => _activeTab = 'grid'),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                                  ),
                                  Container(width: 1, height: 20, color: AppColors.border),
                                  IconButton(
                                    icon: Icon(
                                      Icons.view_stream,
                                      size: 18,
                                      color: _activeTab == 'feed' ? AppColors.primary : AppColors.textMuted,
                                    ),
                                    onPressed: () => setState(() => _activeTab = 'feed'),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        // Posts Grid or Feed Display
                        if (_loadingPosts)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 40),
                            child: Center(child: CircularProgressIndicator()),
                          )
                        else if (_posts.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 40),
                            child: Center(
                              child: Column(
                                children: [
                                  const Icon(Icons.photo_library_outlined, size: 48, color: AppColors.textMuted),
                                  const SizedBox(height: 12),
                                  Text('No Instagram posts found', style: theme.textTheme.titleSmall),
                                ],
                              ),
                            ),
                          )
                        else if (_activeTab == 'grid')
                          _buildPostsGrid()
                        else
                          _buildPostsFeed(),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // CONNECTION CARD UI FOR DISCONNECTED STATE
  Widget _buildConnectionPromptCard(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 30,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF833AB4), Color(0xFFFD1D1D), Color(0xFFF56040)],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFF56040).withValues(alpha: 0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Icon(
              Icons.camera_alt,
              size: 44,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 28),
          Text(
            'Connect Your Instagram',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            'Link your Instagram Business or Creator account to start automating your direct messages and story replies.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: AppColors.textSecondary,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          
          // Step Info Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                _buildRequirementsStepRow(
                  Icons.check_circle,
                  AppColors.success,
                  'Instagram Business or Creator Profile',
                ),
                const SizedBox(height: 12),
                _buildRequirementsStepRow(
                  Icons.check_circle,
                  AppColors.success,
                  'Facebook Page Linked to Instagram',
                ),
                const SizedBox(height: 12),
                _buildRequirementsStepRow(
                  Icons.info_outline,
                  AppColors.accent,
                  'Instant setup using Meta API',
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _showPermissionSheet,
              icon: _isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.camera_alt, size: 20),
              label: Text(_isLoading ? 'Connecting Account...' : 'Continue with Instagram'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE1306C),
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // CONNECTED PROFILE AND QUICK STATS CARD
  Widget _buildConnectedProfileCard(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 30,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              // User Avatar
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFE1306C), width: 3),
                  image: const DecorationImage(
                    image: NetworkImage('https://picsum.photos/seed/user/100/100'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'John Doe Official',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.verified, size: 18, color: Color(0xFF1877F2)),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '@johndoe_official',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFFE1306C),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: Text(
                        'Connected Business',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.success,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 20),
          
          // Profile Stats Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildProfileStatColumn('Posts', '5'),
              _buildProfileStatColumn('Followers', '12.8K'),
              _buildProfileStatColumn('Automations', '3 Active'),
            ],
          ),
          const SizedBox(height: 24),
          
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _isLoading ? null : _disconnectInstagram,
                  icon: const Icon(Icons.link_off, size: 18),
                  label: const Text('Disconnect'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.error,
                    side: const BorderSide(color: AppColors.error, width: 1.5),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/dashboard'),
                  icon: const Icon(Icons.dashboard_outlined, size: 18),
                  label: const Text('Dashboard'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProfileStatColumn(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  // INSTAGRAM POSTS GRID VIEW (3 Columns)
  Widget _buildPostsGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1.0,
      ),
      itemCount: _posts.length,
      itemBuilder: (context, index) {
        final post = _posts[index];
        final postId = post['id'] as String;
        // Mocking automation check
        final hasAutomation = postId == 'post_101' || postId == 'post_102' || postId == 'post_104';
        
        return InkWell(
          onTap: () => _navigateToCreateAutomation(post),
          borderRadius: BorderRadius.circular(12),
          child: Stack(
            fit: StackFit.expand,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(
                  imageUrl: post['media_url'] as String,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    color: Colors.grey[200],
                    child: const Center(
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ),
                  ),
                  errorWidget: (context, url, error) => const Icon(Icons.error),
                ),
              ),
              
              // Automation Indicator Tag
              if (hasAutomation)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.success,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bolt, size: 12, color: Colors.white),
                  ),
                ),
                
              // Overlay comments/likes on hover/tap
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(12),
                      bottomRight: Radius.circular(12),
                    ),
                    gradient: LinearGradient(
                      colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.favorite, size: 10, color: Colors.white),
                          const SizedBox(width: 2),
                          Text(
                            '${post['like_count'] ?? 0}',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.mode_comment, size: 10, color: Colors.white),
                          const SizedBox(width: 2),
                          Text(
                            '${post['comments_count'] ?? 0}',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // INSTAGRAM POSTS FEED/LIST VIEW (Full details)
  Widget _buildPostsFeed() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _posts.length,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final post = _posts[index];
        final postId = post['id'] as String;
        final hasAutomation = postId == 'post_101' || postId == 'post_102' || postId == 'post_104';
        
        // Find matching mock automation keywords for label
        String keywordLabel = '';
        if (postId == 'post_101') keywordLabel = 'setup';
        if (postId == 'post_102') keywordLabel = 'blueprint';
        if (postId == 'post_104') keywordLabel = 'templates';

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 15,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // User header
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 16,
                      backgroundImage: NetworkImage('https://picsum.photos/seed/user/100/100'),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('johndoe_official', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('Instagram Business', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                        ],
                      ),
                    ),
                    Text(
                      '${3 + index} days ago',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ),
              
              // Post Image
              CachedNetworkImage(
                imageUrl: post['media_url'] as String,
                height: 240,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  height: 240,
                  color: Colors.grey[100],
                  child: const Center(child: CircularProgressIndicator()),
                ),
              ),
              
              // Action status & metrics
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Likes & comments
                        Row(
                          children: [
                            const Icon(Icons.favorite, size: 20, color: Color(0xFFEF4444)),
                            const SizedBox(width: 4),
                            Text(
                              '${post['like_count'] ?? 0} likes',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textPrimary),
                            ),
                            const SizedBox(width: 16),
                            const Icon(Icons.mode_comment_outlined, size: 20, color: AppColors.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              '${post['comments_count'] ?? 0} comments',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                        
                        // State Badge
                        if (hasAutomation)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.success.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.bolt, size: 12, color: AppColors.success),
                                const SizedBox(width: 4),
                                Text(
                                  'Trigger: "$keywordLabel"',
                                  style: const TextStyle(color: AppColors.success, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.textMuted.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'No active triggers',
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    
                    // Caption text
                    RichText(
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      text: TextSpan(
                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, height: 1.4),
                        children: [
                          const TextSpan(text: 'johndoe_official ', style: TextStyle(fontWeight: FontWeight.bold)),
                          TextSpan(text: post['caption'] as String),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    
                    // Automation Action Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _navigateToCreateAutomation(post),
                        icon: Icon(hasAutomation ? Icons.edit_note : Icons.add_link, size: 18),
                        label: Text(hasAutomation ? 'Edit DM Automation' : 'Set Up DM Automation'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: hasAutomation ? AppColors.primary : const Color(0xFFE1306C),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRequirementsStepRow(IconData icon, Color iconColor, String text) {
    return Row(
      children: [
        Icon(icon, size: 20, color: iconColor),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}

// SCOPE ELEMENT COMPONENT FOR FACEBOOK LOGIN SCREEN
class _PermissionScopeRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _PermissionScopeRow({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.background,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 22, color: AppColors.primary),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}