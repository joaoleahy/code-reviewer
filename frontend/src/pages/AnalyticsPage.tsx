import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { Download, TrendingUp, Users, Code, Clock } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Button from '../components/UI/Button';
import { useStats, useExport } from '../hooks/useApi';
import { CHART_COLORS } from '../utils/constants';
import { formatNumber, calculateSuccessRate } from '../utils/helpers';

const AnalyticsPage: React.FC = () => {
  const { stats, error, refresh, isLoading } = useStats();
  const { exportStats, isExporting } = useExport();
  const [selectedMetric, setSelectedMetric] = useState<'reviews' | 'score'>('reviews');

  const handleExport = async () => {
    const filename = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    await exportStats(filename);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Loading Analytics
            </h3>
            <p className="text-gray-600">
              Gathering your code review statistics...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading statistics
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button onClick={refresh} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600 mb-4">
              No analytics data found. Submit some code reviews to see statistics.
            </p>
            <Button onClick={refresh} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const successRate = calculateSuccessRate(stats.total_completed, stats.total_reviews);

  const languageChartData = stats.language_stats.map((lang, index) => ({
    ...lang,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  const dailyChartData = stats.daily_stats.slice(-30);

  const scoreDistributionData = Object.entries(stats.score_distribution)
    .map(([score, count]) => ({
      score: `${score}/10`,
      count,
      fill: count > 0 ? CHART_COLORS[parseInt(score) - 1] : '#e5e7eb'
    }))
    .filter(item => item.count > 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Code review insights and quality trends
            </p>
          </div>
          
          <Button
            onClick={handleExport}
            loading={isExporting}
            icon={Download}
            variant="outline"
          >
            Export Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Reviews"
            value={formatNumber(stats.total_reviews)}
            icon={Code}
            color="blue"
            description={`${stats.total_completed} completed`}
          />
          
          <MetricCard
            title="Success Rate"
            value={`${formatNumber(successRate, 1)}%`}
            icon={TrendingUp}
            color="green"
            description={`${stats.total_failed} failed`}
          />
          
          <MetricCard
            title="Average Score"
            value={`${formatNumber(stats.average_quality_score, 1)}/10`}
            icon={Users}
            color="purple"
            description="Overall quality"
          />
          
          <MetricCard
            title="Average Time"
            value={`${formatNumber(stats.average_processing_time, 2)}s`}
            icon={Clock}
            color="orange"
            description="Processing"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reviews by Language
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={languageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="language" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: any) => [formatNumber(value), 'Reviews']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quality Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ score, count }) => `${score}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {scoreDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatNumber(value), 'Reviews']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Daily Trends (Last 30 days)
            </h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={selectedMetric === 'reviews' ? 'primary' : 'outline'}
                onClick={() => setSelectedMetric('reviews')}
              >
                Reviews
              </Button>
              <Button
                size="sm"
                variant={selectedMetric === 'score' ? 'primary' : 'outline'}
                onClick={() => setSelectedMetric('score')}
              >
                Average Score
              </Button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US')}
                formatter={(value: any) => [
                  selectedMetric === 'reviews' ? formatNumber(value) : formatNumber(value, 1), 
                  selectedMetric === 'reviews' ? 'Reviews' : 'Average Score'
                ]}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric === 'reviews' ? 'count' : 'average_score'}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Most Common Issues
          </h3>
          
          {stats.common_issues.length > 0 ? (
            <div className="space-y-4">
              {stats.common_issues.slice(0, 10).map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{issue.issue}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(issue.count / Math.max(...stats.common_issues.map(i => i.count))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {issue.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No common issues identified yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description: string;
}> = ({ title, value, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    orange: 'bg-orange-500 text-orange-600 bg-orange-50'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default AnalyticsPage;
