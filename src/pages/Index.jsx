import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DayPicker } from "react-day-picker";
import { format, getUnixTime } from "date-fns"; // Importing format and getUnixTime from date-fns
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Line } from "react-chartjs-2";
import { toast } from "sonner";

const fetchFacebookData = async ({ queryKey }) => {
  const [_, { token, startDate, endDate }] = queryKey;
  const response = await fetch(
    `https://graph.facebook.com/v12.0/me/insights?metric=page_impressions,page_engaged_users&period=day&since=${startDate}&until=${endDate}&access_token=${token}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const Index = () => {
  const [token, setToken] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["facebookData", { token, startDate: dateRange.from ? getUnixTime(dateRange.from) : null, endDate: dateRange.to ? getUnixTime(dateRange.to) : null }],
    queryFn: fetchFacebookData,
    enabled: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token || !dateRange.from || !dateRange.to) {
      toast.error("Please fill in all fields");
      return;
    }
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Facebook Instream Ads Earnings and Views</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Facebook Page Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              footer={
                dateRange.from && dateRange.to
                  ? `Selected from ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")}`
                  : "Please select a date range"
              }
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Fetch Data"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-red-500">{error.message}</p>}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <Line
                data={{
                  labels: data.map((item) => item.date),
                  datasets: [
                    {
                      label: "Earnings",
                      data: data.map((item) => item.earnings),
                      borderColor: "rgba(75,192,192,1)",
                      fill: false,
                    },
                    {
                      label: "Views",
                      data: data.map((item) => item.views),
                      borderColor: "rgba(153,102,255,1)",
                      fill: false,
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>{video.title}</TableCell>
                      <TableCell>{video.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Index;