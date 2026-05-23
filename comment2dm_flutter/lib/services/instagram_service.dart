import 'dart:convert';
import 'package:http/http.dart' as http;

class InstagramService {
  static const String _graphApiBase = 'https://graph.facebook.com/v21.0';
  static const String _instagramAuthUrl = 'https://api.instagram.com/oauth';

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
      Uri.parse('$_instagramAuthUrl/access_token'),
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
    throw Exception('Failed to get media');
  }

  // Get comments on a media post
  Future<List<Map<String, dynamic>>> getComments(String mediaId, String accessToken) async {
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
    throw Exception('Failed to get comments');
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
}