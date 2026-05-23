class ActivityLog {
  final String id;
  final String automationId;
  final String keyword;
  final String commentAuthor;
  final DateTime timestamp;
  final String status; // 'success', 'failed'

  ActivityLog({
    required this.id,
    required this.automationId,
    required this.keyword,
    required this.commentAuthor,
    required this.timestamp,
    required this.status,
  });

  factory ActivityLog.fromJson(Map<String, dynamic> json) {
    return ActivityLog(
      id: json['id'] as String,
      automationId: json['automationId'] as String,
      keyword: json['keyword'] as String,
      commentAuthor: json['commentAuthor'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'automationId': automationId,
      'keyword': keyword,
      'commentAuthor': commentAuthor,
      'timestamp': timestamp.toIso8601String(),
      'status': status,
    };
  }
}