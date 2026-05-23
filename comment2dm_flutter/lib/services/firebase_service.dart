import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../models/automation_model.dart';
import '../models/activity_log_model.dart';
import '../models/analytics_data_model.dart';

class FirebaseService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Auth Methods
  Stream<User?> get authStateChanges => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  Future<UserModel> signInWithEmail(String email, String password) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return await getUserData(credential.user!.uid);
  }

  Future<UserModel> signUpWithEmail(String email, String password, String name) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    final user = UserModel(
      id: credential.user!.uid,
      email: email,
      name: name,
      createdAt: DateTime.now(),
    );
    await _firestore.collection('users').doc(user.id).set(user.toJson());
    return user;
  }

  Future<void> signOut() async {
    await _auth.signOut();
    await _storage.deleteAll();
  }

  Future<UserModel> getUserData(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    if (!doc.exists) throw Exception('User not found');
    return UserModel.fromJson(doc.data()!);
  }

  Future<void> updateUserData(String uid, Map<String, dynamic> data) async {
    await _firestore.collection('users').doc(uid).update(data);
  }

  // Instagram Connection
  Future<void> connectInstagram(String userId, String handle, String profilePic, String accessToken) async {
    await _firestore.collection('users').doc(userId).update({
      'instagramConnected': true,
      'instagramHandle': handle,
      'instagramProfilePic': profilePic,
    });
    await _firestore.collection('instagram_tokens').doc(userId).set({
      'accessToken': accessToken,
      'connectedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> disconnectInstagram(String userId) async {
    await _firestore.collection('users').doc(userId).update({
      'instagramConnected': false,
      'instagramHandle': FieldValue.delete(),
      'instagramProfilePic': FieldValue.delete(),
    });
    await _firestore.collection('instagram_tokens').doc(userId).delete();
  }

  // Automation Methods
  Future<List<AutomationModel>> getAutomations(String userId) async {
    final snapshot = await _firestore
        .collection('automations')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .get();
    return snapshot.docs.map((doc) => AutomationModel.fromJson(doc.data())).toList();
  }

  Future<AutomationModel> createAutomation(AutomationModel automation) async {
    await _firestore.collection('automations').doc(automation.id).set(automation.toJson());
    return automation;
  }

  Future<void> updateAutomation(String id, Map<String, dynamic> data) async {
    await _firestore.collection('automations').doc(id).update(data);
  }

  Future<void> deleteAutomation(String id) async {
    await _firestore.collection('automations').doc(id).delete();
  }

  Future<void> toggleAutomation(String id, bool active) async {
    await _firestore.collection('automations').doc(id).update({'active': active});
  }

  // Activity Log Methods
  Future<List<ActivityLog>> getActivityLogs(String userId, {int limit = 20}) async {
    final snapshot = await _firestore
        .collection('activity_logs')
        .where('userId', isEqualTo: userId)
        .orderBy('timestamp', descending: true)
        .limit(limit)
        .get();
    return snapshot.docs.map((doc) => ActivityLog.fromJson(doc.data())).toList();
  }

  // Analytics Methods
  Future<List<AnalyticsData>> getAnalytics(String userId, {int days = 7}) async {
    final endDate = DateTime.now();
    final startDate = endDate.subtract(Duration(days: days));
    
    final snapshot = await _firestore
        .collection('analytics')
        .where('userId', isEqualTo: userId)
        .where('date', isGreaterThanOrEqualTo: startDate.toIso8601String().split('T')[0])
        .orderBy('date')
        .get();
    
    return snapshot.docs.map((doc) => AnalyticsData.fromJson(doc.data())).toList();
  }

  // DM Quota Methods
  Future<void> incrementDmCount(String userId) async {
    await _firestore.collection('users').doc(userId).update({
      'dmSentThisMonth': FieldValue.increment(1),
    });
    // Also log the DM
    await _firestore.collection('usage_logs').add({
      'userId': userId,
      'type': 'dm_sent',
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  Future<int> getCurrentDmCount(String userId) async {
    final user = await getUserData(userId);
    return user.dmSentThisMonth;
  }

  Future<bool> canSendDm(String userId) async {
    final user = await getUserData(userId);
    return !user.isQuotaExceeded;
  }
}