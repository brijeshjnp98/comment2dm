class UserModel {
  final String id;
  final String email;
  final String name;
  final bool instagramConnected;
  final String? instagramHandle;
  final String? instagramProfilePic;
  final String plan; // 'starter', 'growth', 'unlimited'
  final int dmSentThisMonth;
  final int dmQuota;
  final DateTime? createdAt;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.instagramConnected = false,
    this.instagramHandle,
    this.instagramProfilePic,
    this.plan = 'starter',
    this.dmSentThisMonth = 0,
    this.dmQuota = 1000,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      instagramConnected: json['instagramConnected'] as bool? ?? false,
      instagramHandle: json['instagramHandle'] as String?,
      instagramProfilePic: json['instagramProfilePic'] as String?,
      plan: json['plan'] as String? ?? 'starter',
      dmSentThisMonth: json['dmSentThisMonth'] as int? ?? 0,
      dmQuota: json['dmQuota'] as int? ?? 1000,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'instagramConnected': instagramConnected,
      'instagramHandle': instagramHandle,
      'instagramProfilePic': instagramProfilePic,
      'plan': plan,
      'dmSentThisMonth': dmSentThisMonth,
      'dmQuota': dmQuota,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    bool? instagramConnected,
    String? instagramHandle,
    String? instagramProfilePic,
    String? plan,
    int? dmSentThisMonth,
    int? dmQuota,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      instagramConnected: instagramConnected ?? this.instagramConnected,
      instagramHandle: instagramHandle ?? this.instagramHandle,
      instagramProfilePic: instagramProfilePic ?? this.instagramProfilePic,
      plan: plan ?? this.plan,
      dmSentThisMonth: dmSentThisMonth ?? this.dmSentThisMonth,
      dmQuota: dmQuota ?? this.dmQuota,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  double get quotaPercentage {
    if (dmQuota == 0) return 0;
    return (dmSentThisMonth / dmQuota).clamp(0.0, 1.0);
  }

  int get remainingDms => dmQuota - dmSentThisMonth;
  bool get isQuotaExceeded => dmSentThisMonth >= dmQuota;

  static const Map<String, int> planPricing = {
    'starter': 5,
    'growth': 10,
    'unlimited': 25,
  };

  static const Map<String, int> planQuotas = {
    'starter': 1000,
    'growth': 2500,
    'unlimited': 999999,
  };
}