import React from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ExamAnalytics {
  examId: number;
  totalAttempts: number;
  uniqueStudents: number;
  meanScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  stdDeviation: number;
  passPercentage: number;
  failPercentage: number;
  scoreDistribution: Record<string, number>;
  takenAt: string;
}

interface ExamAnalyticsDashboardProps {
  examId: number;
}

export const ExamAnalyticsDashboard: React.FC<ExamAnalyticsDashboardProps> = ({ examId }) => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["analytics", "exam", examId],
    queryFn: () => customFetch<ExamAnalytics>(`/api/analytics/exam/${examId}`),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["analytics", "exam", examId, "history"],
    queryFn: () =>
      customFetch<
        Array<{
          meanScore: number;
          passPercentage: number;
          totalAttempts: number;
          takenAt: string;
        }>
      >(`/api/analytics/exam/${examId}/history`),
  });

  if (isLoading || historyLoading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">Failed to load analytics</p>;
  if (!analytics) return <p>No analytics available</p>;

  // Prepare score distribution data
  const distributionData = Object.entries(analytics.scoreDistribution).map(
    ([range, count]) => ({
      range,
      count,
    })
  );

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Total Attempts</p>
            <p className="text-2xl font-bold">{analytics.totalAttempts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Mean Score</p>
            <p className="text-2xl font-bold">{analytics.meanScore.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Pass Percentage</p>
            <p className="text-2xl font-bold text-green-600">{analytics.passPercentage.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Std Deviation</p>
            <p className="text-2xl font-bold">{analytics.stdDeviation.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      {distributionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Historical Trend */}
      {history && history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="takenAt" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="meanScore"
                  stroke="#3b82f6"
                  name="Mean Score"
                />
                <Line
                  type="monotone"
                  dataKey="passPercentage"
                  stroke="#10b981"
                  name="Pass %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Median Score</p>
              <p className="font-semibold">{analytics.medianScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-600">Min Score</p>
              <p className="font-semibold">{analytics.minScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-600">Max Score</p>
              <p className="font-semibold">{analytics.maxScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-600">Unique Students</p>
              <p className="font-semibold">{analytics.uniqueStudents}</p>
            </div>
            <div>
              <p className="text-gray-600">Fail Percentage</p>
              <p className="font-semibold text-red-600">{analytics.failPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
