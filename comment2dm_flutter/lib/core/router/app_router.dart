import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/auth/signup_screen.dart';
import '../../screens/auth/landing_screen.dart';
import '../../screens/dashboard/dashboard_screen.dart';
import '../../screens/dashboard/dashboard_layout.dart';
import '../../screens/automations/automations_screen.dart';
import '../../screens/automations/create_automation_screen.dart';
import '../../screens/analytics/analytics_screen.dart';
import '../../screens/billing/billing_screen.dart';
import '../../screens/settings/settings_screen.dart';
import '../../screens/instagram/instagram_connect_screen.dart';

class AppRouter {
  final GoRouter router;

  AppRouter()
      : router = GoRouter(
          initialLocation: '/',
          routes: [
            GoRoute(
              path: '/',
              name: 'landing',
              builder: (context, state) => const LandingScreen(),
            ),
            GoRoute(
              path: '/login',
              name: 'login',
              builder: (context, state) => const LoginScreen(),
            ),
            GoRoute(
              path: '/signup',
              name: 'signup',
              builder: (context, state) => const SignupScreen(),
            ),
            ShellRoute(
              builder: (context, state, child) => DashboardLayout(child: child),
              routes: [
                GoRoute(
                  path: '/dashboard',
                  name: 'dashboard',
                  builder: (context, state) => const DashboardScreen(),
                ),
                GoRoute(
                  path: '/dashboard/automations',
                  name: 'automations',
                  builder: (context, state) => const AutomationsScreen(),
                ),
                GoRoute(
                  path: '/dashboard/automations/new',
                  name: 'createAutomation',
                  builder: (context, state) => const CreateAutomationScreen(),
                ),
                GoRoute(
                  path: '/dashboard/analytics',
                  name: 'analytics',
                  builder: (context, state) => const AnalyticsScreen(),
                ),
                GoRoute(
                  path: '/dashboard/billing',
                  name: 'billing',
                  builder: (context, state) => const BillingScreen(),
                ),
                GoRoute(
                  path: '/dashboard/settings',
                  name: 'settings',
                  builder: (context, state) => const SettingsScreen(),
                ),
                GoRoute(
                  path: '/dashboard/instagram',
                  name: 'instagramConnect',
                  builder: (context, state) => const InstagramConnectScreen(),
                ),
              ],
            ),
          ],
        );
}