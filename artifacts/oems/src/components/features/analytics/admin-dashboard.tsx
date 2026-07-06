import React from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface DashboardAnalytics {
  totalStudents: number;
  totalCourses: number;
  totalExams: number;
  pendingExams?: number;
  averageClassScore: number;
  overallPassPercentage: number;
}

export const AdminDashboard: React.FC = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => customFetch<DashboardAnalytics>("/api/analytics/dashboard"),
  });

  if (isLoading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">Failed to load analytics</p>;
  if (!analytics) return <p>No analytics available</p>;

  const metricsData = [
    {
      label: "Total Students",
      value: analytics.totalStudents,
      color: "text-blue-600",
    },
    {
      label: "Total Courses",
      value: analytics.totalCourses,
      color: "text-purple-600",
    },
    {
      label: "Total Exams",
      value: analytics.totalExams,
      color: "text-green-600",
    },
    {
      label: "Average Class Score",
      value: `${parseFloat(analytics.averageClassScore).toFixed(1)}/100`,
      color: "text-orange-600",
    },
    {
      label: "Pass Percentage",
      value: `${parseFloat(analytics.overallPassPercentage).toFixed(1)}%`,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricsData.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm mb-2">{metric.label}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Active Students</span>
                <span className="font-semibold">{analytics.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Courses Offered</span>
                <span className="font-semibold">{analytics.totalCourses}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Exams Created</span>
                <span className="font-semibold">{analytics.totalExams}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Pass Rate</span>
                <span className={`font-semibold text-green-600`}>
                  {parseFloat(analytics.overallPassPercentage).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Class Average Score</span>
                  <span className="text-sm font-semibold">
                    {parseFloat(analytics.averageClassScore).toFixed(1)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${parseFloat(analytics.averageClassScore)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Overall Pass Rate</span>
                  <span className="text-sm font-semibold">
                    {parseFloat(analytics.overallPassPercentage).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${parseFloat(analytics.overallPassPercentage)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
