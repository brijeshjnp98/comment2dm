class AnalyticsData {
  final String date;
  final int sent;
  final int detected;
  final int failed;

  AnalyticsData({
    required this.date,
    required this.sent,
    required this.detected,
    this.failed = 0,
  });

  factory AnalyticsData.fromJson(Map<String, dynamic> json) {
    return AnalyticsData(
      date: json['date'] as String,
      sent: json['sent'] as int,
      detected: json['detected'] as int,
      failed: json['failed'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'sent': sent,
      'detected': detected,
      'failed': failed,
    };
  }
}