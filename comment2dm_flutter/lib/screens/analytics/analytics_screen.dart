import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme/app_theme.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Analytics', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text('Track your engagement performance over time.', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 24),

          // Stats Row
          Row(
            children: [
              Expanded(child: _MiniStatCard(
                icon: Icons.message, iconColor: Colors.blue,
                label: 'Detected Comments', value: '3,482', trend: '+14%', trendUp: true,
              )),
              const SizedBox(width: 16),
              Expanded(child: _MiniStatCard(
                icon: Icons.trending_up, iconColor: AppColors.success,
                label: 'Successful DMs', value: '3,212', trend: '+12%', trendUp: true,
              )),
              const SizedBox(width: 16),
              Expanded(child: _MiniStatCard(
                icon: Icons.people, iconColor: Colors.purple,
                label: 'Unique Users', value: '1,824', trend: '+8%', trendUp: true,
              )),
              const SizedBox(width: 16),
              Expanded(child: _MiniStatCard(
                icon: Icons.warning_amber, iconColor: AppColors.error,
                label: 'Failed Deliveries', value: '24', trend: '-5%', trendUp: false,
              )),
            ],
          ),
          const SizedBox(height: 24),

          // Charts Row
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Delivery Performance', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 4),
                      Text('Daily comparison of detected comments vs sent DMs.', style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(height: 24),
                      SizedBox(
                        height: 300,
                        child: BarChart(
                          BarChartData(
                            alignment: BarChartAlignment.spaceAround,
                            maxY: 80,
                            barTouchData: BarTouchData(enabled: false),
                            titlesData: FlTitlesData(
                              show: true,
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (value, meta) {
                                    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(days[value.toInt()], style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                    );
                                  },
                                ),
                              ),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(showTitles: true, reservedSize: 40),
                              ),
                              topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            ),
                            gridData: FlGridData(
                              show: true,
                              drawVerticalLine: false,
                              horizontalInterval: 20,
                              getDrawingHorizontalLine: (value) => FlLine(
                                color: AppColors.border.withValues(alpha: 0.5),
                                strokeWidth: 1,
                              ),
                            ),
                            barGroups: [
                              _makeBarGroup(0, 48, 45),
                              _makeBarGroup(1, 55, 52),
                              _makeBarGroup(2, 42, 38),
                              _makeBarGroup(3, 68, 65),
                              _makeBarGroup(4, 50, 48),
                              _makeBarGroup(5, 28, 24),
                              _makeBarGroup(6, 35, 32),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _LegendItem(color: AppColors.accent, label: 'Comments Detected'),
                          const SizedBox(width: 24),
                          _LegendItem(color: AppColors.primary, label: 'DMs Sent'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Growth Trend', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 4),
                      Text('Weekly progression of successful automations.', style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(height: 24),
                      SizedBox(
                        height: 300,
                        child: LineChart(
                          LineChartData(
                            gridData: FlGridData(
                              show: true,
                              drawVerticalLine: false,
                              horizontalInterval: 20,
                              getDrawingHorizontalLine: (value) => FlLine(
                                color: AppColors.border.withValues(alpha: 0.5),
                                strokeWidth: 1,
                              ),
                            ),
                            titlesData: FlTitlesData(
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (value, meta) {
                                    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(days[value.toInt()], style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                    );
                                  },
                                ),
                              ),
                              leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
                              topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            ),
                            minY: 0,
                            maxY: 80,
                            lineBarsData: [
                              LineChartBarData(
                                spots: [
                                  FlSpot(0, 45), FlSpot(1, 52), FlSpot(2, 38),
                                  FlSpot(3, 65), FlSpot(4, 48), FlSpot(5, 24), FlSpot(6, 32),
                                ],
                                isCurved: true,
                                color: AppColors.primary,
                                barWidth: 3,
                                dotData: FlDotData(show: false),
                                belowBarData: BarAreaData(
                                  show: true,
                                  color: AppColors.primary.withValues(alpha: 0.1),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  BarChartGroupData _makeBarGroup(int x, double detected, double sent) {
    return BarChartGroupData(x: x, barRods: [
      BarChartRodData(
        toY: detected,
        color: AppColors.accent,
        width: 16,
        borderRadius: const BorderRadius.only(topLeft: Radius.circular(4), topRight: Radius.circular(4)),
      ),
      BarChartRodData(
        toY: sent,
        color: AppColors.primary,
        width: 16,
        borderRadius: const BorderRadius.only(topLeft: Radius.circular(4), topRight: Radius.circular(4)),
      ),
    ]);
  }
}

class _MiniStatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String trend;
  final bool trendUp;

  const _MiniStatCard({
    required this.icon, required this.iconColor, required this.label,
    required this.value, required this.trend, required this.trendUp,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, size: 18, color: iconColor),
              Text(trend, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: trendUp ? AppColors.success : AppColors.error)),
            ],
          ),
          const SizedBox(height: 12),
          Text(value, style: Theme.of(context).textTheme.displaySmall?.copyWith(fontSize: 26)),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.5)),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
      ],
    );
  }
}