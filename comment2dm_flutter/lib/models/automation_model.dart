class AutomationModel {
  final String id;
  final String userId;
  final List<String> keywords;
  final String replyMessage;
  final String targetUrl;
  final bool active;
  final DateTime createdAt;
  final int totalSent;

  AutomationModel({
    required this.id,
    required this.userId,
    required this.keywords,
    required this.replyMessage,
    required this.targetUrl,
    this.active = true,
    required this.createdAt,
    this.totalSent = 0,
  });

  factory AutomationModel.fromJson(Map<String, dynamic> json) {
    return AutomationModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      keywords: List<String>.from(json['keywords'] as List),
      replyMessage: json['replyMessage'] as String,
      targetUrl: json['targetUrl'] as String,
      active: json['active'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      totalSent: json['totalSent'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'keywords': keywords,
      'replyMessage': replyMessage,
      'targetUrl': targetUrl,
      'active': active,
      'createdAt': createdAt.toIso8601String(),
      'totalSent': totalSent,
    };
  }

  AutomationModel copyWith({
    String? id,
    String? userId,
    List<String>? keywords,
    String? replyMessage,
    String? targetUrl,
    bool? active,
    DateTime? createdAt,
    int? totalSent,
  }) {
    return AutomationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      keywords: keywords ?? this.keywords,
      replyMessage: replyMessage ?? this.replyMessage,
      targetUrl: targetUrl ?? this.targetUrl,
      active: active ?? this.active,
      createdAt: createdAt ?? this.createdAt,
      totalSent: totalSent ?? this.totalSent,
    );
  }
}