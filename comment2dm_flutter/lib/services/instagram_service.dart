import 'dart:convert';
import 'package:http/http.dart' as http;

class InstagramService {
  static const String _graphApiBase = 'https://graph.facebook.com/v21.0';
  static const String _instagramAuthUrl = 'https://www.instagram.com/oauth';
  static const String _instagramTokenUrl = 'https://api.instagram.com/oauth';

  // Instagram OAuth - Step 1: Get authorization URL
  String getAuthorizationUrl(String clientId, String redirectUri) {
    final params = {
      'client_id': clientId,
      'redirect_uri': redirectUri,
      'scope': 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments',
      'response_type': 'code',
    };
    final uri = Uri.parse('$_instagramAuthUrl/authorize').replace(queryParameters: params);
    return uri.toString();
  }

  // Instagram OAuth - Step 2: Exchange code for access token
  Future<Map<String, dynamic>> exchangeCodeForToken(
    String clientId,
    String clientSecret,
    String redirectUri,
    String code,
  ) async {
    final response = await http.post(
      Uri.parse('$_instagramTokenUrl/access_token'),
      body: {
        'client_id': clientId,
        'client_secret': clientSecret,
        'redirect_uri': redirectUri,
        'code': code,
        'grant_type': 'authorization_code',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to exchange code for token: ${response.body}');
  }

  // Get Instagram Business Account ID
  Future<String?> getInstagramBusinessAccountId(String accessToken) async {
    final response = await http.get(
      Uri.parse('$_graphApiBase/me/accounts').replace(queryParameters: {
        'access_token': accessToken,
        'fields': 'id,name,instagram_business_account',
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      final accounts = data['data'] as List<dynamic>? ?? [];
      for (final account in accounts) {
        if (account['instagram_business_account'] != null) {
          return account['instagram_business_account']['id'] as String;
        }
      }
    }
    return null;
  }

  // Get Instagram User Profile
  Future<Map<String, dynamic>> getInstagramProfile(String igUserId, String accessToken) async {
    final response = await http.get(
      Uri.parse('$_graphApiBase/$igUserId').replace(queryParameters: {
        'access_token': accessToken,
        'fields': 'id,username,profile_picture_url,name',
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to get Instagram profile');
  }

  // Get recent media (posts/reels)
  Future<List<Map<String, dynamic>>> getRecentMedia(String igUserId, String accessToken) async {
    if (accessToken == 'mock_token' || accessToken.isEmpty || accessToken.startsWith('mock_')) {
      await Future.delayed(const Duration(milliseconds: 500));
      return mockPosts;
    }
    try {
      final response = await http.get(
        Uri.parse('$_graphApiBase/$igUserId/media').replace(queryParameters: {
          'access_token': accessToken,
          'fields': 'id,caption,media_type,media_url,permalink,timestamp,comments_count',
          'limit': '25',
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return (data['data'] as List<dynamic>).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return mockPosts;
  }

  // Get comments on a media post
  Future<List<Map<String, dynamic>>> getComments(String mediaId, String accessToken) async {
    if (accessToken == 'mock_token' || accessToken.isEmpty || accessToken.startsWith('mock_')) {
      await Future.delayed(const Duration(milliseconds: 300));
      return [];
    }
    try {
      final response = await http.get(
        Uri.parse('$_graphApiBase/$mediaId/comments').replace(queryParameters: {
          'access_token': accessToken,
          'fields': 'id,text,timestamp,username',
          'limit': '100',
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return (data['data'] as List<dynamic>).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  // Reply to a comment via DM (using Instagram Messaging API)
  Future<bool> sendDirectMessage(
    String igUserId,
    String recipientId,
    String message,
    String? linkUrl,
    String accessToken,
  ) async {
    try {
      Map<String, dynamic> messageData = {
        'recipient': {'id': recipientId},
        'messaging_type': 'RESPONSE',
        'message': {
          'text': message,
        },
      };

      // If link is provided, append it to message
      if (linkUrl != null && linkUrl.isNotEmpty) {
        messageData['message'] = {
          'text': '$message\n\n$linkUrl',
        };
      }

      final response = await http.post(
        Uri.parse('$_graphApiBase/$igUserId/messages').replace(queryParameters: {
          'access_token': accessToken,
        }),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(messageData),
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body) as Map<String, dynamic>;
        return result['message_id'] != null;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Reply to a comment (public reply)
  Future<bool> replyToComment(String commentId, String message, String accessToken) async {
    try {
      final response = await http.post(
        Uri.parse('$_graphApiBase/$commentId/replies').replace(queryParameters: {
          'access_token': accessToken,
        }),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'message': message,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Check if comment contains any of the keywords
  bool matchesKeywords(String commentText, List<String> keywords) {
    final lowerComment = commentText.toLowerCase();
    return keywords.any((keyword) => lowerComment.contains(keyword.toLowerCase()));
  }

  // Refresh long-lived token
  Future<String> refreshLongLivedToken(String shortLivedToken, String clientSecret) async {
    final response = await http.get(
      Uri.parse('https://graph.facebook.com/v21.0/oauth/access_token').replace(queryParameters: {
        'grant_type': 'fb_exchange_token',
        'client_id': 'YOUR_APP_ID',
        'client_secret': clientSecret,
        'fb_exchange_token': shortLivedToken,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      return data['access_token'] as String;
    }
    throw Exception('Failed to refresh token');
  }

  // Mock posts data for simulated state
  static final List<Map<String, dynamic>> mockPosts = [
    {
      'id': 'post_101',
      'media_type': 'IMAGE',
      'media_url': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
      'caption': 'Behind the scenes of our new workspace setup 💻 Comment "setup" to get links to all the gear!',
      'permalink': 'https://instagram.com/p/post_101',
      'timestamp': '2026-06-07T12:00:00Z',
      'like_count': 342,
      'comments_count': 56,
    },
    {
      'id': 'post_102',
      'media_type': 'IMAGE',
      'media_url': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      'caption': 'My new E-book "Instagram Growth Blueprint" is finally out! 🚀 Comment "blueprint" to get a free copy.',
      'permalink': 'https://instagram.com/p/post_102',
      'timestamp': '2026-06-06T15:30:00Z',
      'like_count': 824,
      'comments_count': 142,
    },
    {
      'id': 'post_103',
      'media_type': 'IMAGE',
      'media_url': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80',
      'caption': 'We are hosting a live webinar this Thursday on how to automate your business DMs. Comment "webinar" for the registration link!',
      'permalink': 'https://instagram.com/p/post_103',
      'timestamp': '2026-06-05T09:00:00Z',
      'like_count': 198,
      'comments_count': 43,
    },
    {
      'id': 'post_104',
      'media_type': 'IMAGE',
      'media_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      'caption': 'Want these Canva templates for free? 🎨 Comment "templates" and check your DMs!',
      'permalink': 'https://instagram.com/p/post_104',
      'timestamp': '2026-06-04T18:20:00Z',
      'like_count': 512,
      'comments_count': 98,
    },
    {
      'id': 'post_105',
      'media_type': 'IMAGE',
      'media_url': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      'caption': 'Consistency is key. What are your goals for this week? Let me know below 👇',
      'permalink': 'https://instagram.com/p/post_105',
      'timestamp': '2026-06-03T10:00:00Z',
      'like_count': 124,
      'comments_count': 12,
    },
  ];

  // Helper to suggest keywords from caption text
  static List<String> suggestKeywords(String caption) {
    final suggestions = <String>[];
    
    // Pattern 1: Look for words inside double quotes
    final quoteRegExp = RegExp(r'["\u201C\u201D]([a-zA-Z0-9_-]+)["\u201C\u201D]');
    final quoteMatches = quoteRegExp.allMatches(caption);
    for (final match in quoteMatches) {
      if (match.groupCount >= 1) {
        final val = match.group(1)!.trim().toLowerCase();
        if (val.isNotEmpty && !suggestions.contains(val)) {
          suggestions.add(val);
        }
      }
    }

    // Pattern 2: Look for words inside single quotes
    final singleQuoteRegExp = RegExp(r"['\u2018\u2019]([a-zA-Z0-9_-]+)['\u2018\u2019]");
    final singleQuoteMatches = singleQuoteRegExp.allMatches(caption);
    for (final match in singleQuoteMatches) {
      if (match.groupCount >= 1) {
        final val = match.group(1)!.trim().toLowerCase();
        if (val.isNotEmpty && !suggestions.contains(val)) {
          suggestions.add(val);
        }
      }
    }

    // Pattern 3: Look for words after "comment" or "dm" (case-insensitive)
    final wordRegExp = RegExp(r'(?:comment|dm|type)\s+([a-zA-Z0-9_-]+)', caseSensitive: false);
    final wordMatches = wordRegExp.allMatches(caption);
    for (final match in wordMatches) {
      if (match.groupCount >= 1) {
        final val = match.group(1)!.trim().toLowerCase();
        const skip = {'to', 'for', 'below', 'now', 'a', 'the', 'this', 'and', 'my', 'your', 'with'};
        if (val.isNotEmpty && !skip.contains(val) && !suggestions.contains(val)) {
          suggestions.add(val);
        }
      }
    }

    return suggestions;
  }
}