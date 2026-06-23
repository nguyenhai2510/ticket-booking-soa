import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { eventService, Event } from '@/api/eventService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  name: string;
  'Vé đã bán': number;
  'Tổng số vé': number;
}

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Summary figures
  const [totalEvents, setTotalEvents] = useState(12); // Default mock fallback
  const [ticketsSold, setTicketsSold] = useState(45920);
  const [revenue, setRevenue] = useState('₫2.4B');
  const [upcomingEvents, setUpcomingEvents] = useState(3);

  // Mock booking data matching the Stitch layout
  const mockChartData: ChartData[] = [
    { name: 'Summer Concert', 'Vé đã bán': 850, 'Tổng số vé': 1000 },
    { name: 'Tech Summit', 'Vé đã bán': 120, 'Tổng số vé': 500 },
    { name: 'Art Gallery', 'Vé đã bán': 300, 'Tổng số vé': 300 },
    { name: 'Rock Festival', 'Vé đã bán': 1500, 'Tổng số vé': 2000 },
    { name: 'Jazz Night', 'Vé đã bán': 80, 'Tổng số vé': 150 },
  ];

  useEffect(() => {
    eventService.getEvents()
      .then((data) => {
        setEvents(data);
        if (data && data.length > 0) {
          setTotalEvents(data.length);
          // Calculate dynamically if ticketCategories exist
          let soldCount = 0;
          let upcoming = 0;
          const now = new Date();

          data.forEach(evt => {
            if (evt.eventDate && new Date(evt.eventDate) > now) {
              upcoming++;
            }
            if (evt.ticketCategories) {
              evt.ticketCategories.forEach(cat => {
                soldCount += (cat.totalQuantity - cat.availableQuantity);
              });
            }
          });

          if (soldCount > 0) {
            setTicketsSold(soldCount);
            // Estimate revenue based on sold tickets (mock price 500k vnd)
            const estimatedRevenue = soldCount * 500000;
            if (estimatedRevenue >= 1000000000) {
              setRevenue(`₫${(estimatedRevenue / 1000000000).toFixed(1)}B`);
            } else if (estimatedRevenue >= 1000000) {
              setRevenue(`₫${(estimatedRevenue / 1000000).toFixed(0)}M`);
            } else {
              setRevenue(`₫${estimatedRevenue.toLocaleString()}`);
            }
          }
          setUpcomingEvents(upcoming > 0 ? upcoming : 3);
        }
      })
      .catch((err) => console.error('Error fetching events count:', err))
      .finally(() => setLoading(false));
  }, []);

  // Prepare chart data dynamically if we have events, otherwise use mockChartData
  const getChartData = (): ChartData[] => {
    if (events.length === 0) return mockChartData;
    
    return events.slice(0, 6).map(evt => {
      let sold = 0;
      let total = 0;
      if (evt.ticketCategories && evt.ticketCategories.length > 0) {
        evt.ticketCategories.forEach(cat => {
          total += cat.totalQuantity || 0;
          sold += (cat.totalQuantity || 0) - (cat.availableQuantity || 0);
        });
      } else {
        // Fallback for events without categories
        total = 100;
        sold = 30;
      }
      return {
        name: evt.title.length > 15 ? evt.title.substring(0, 15) + '...' : evt.title,
        'Vé đã bán': sold,
        'Tổng số vé': total,
      };
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-outline-variant/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Tổng Sự Kiện
            </CardTitle>
            <div className="p-2 bg-primary-container/10 text-primary rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                event_available
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : totalEvents}</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +12% so với tháng trước
            </p>
            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 2 */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-outline-variant/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Vé Đã Bán
            </CardTitle>
            <div className="p-2 bg-secondary-container/20 text-secondary rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                confirmation_number
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : ticketsSold.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +5.4% tuần này
            </p>
            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '55%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 3 */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-outline-variant/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Doanh Thu Ước Tính
            </CardTitle>
            <div className="p-2 bg-tertiary-container/10 text-tertiary rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : revenue}</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +21% tháng này
            </p>
            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 4 */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-outline-variant/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Sự Kiện Sắp Diễn Ra
            </CardTitle>
            <div className="p-2 bg-primary-container/10 text-primary rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                schedule
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : upcomingEvents}</div>
            <p className="text-xs text-on-surface-variant/70 font-medium flex items-center gap-1 mt-1">
              Hệ thống hoạt động ổn định
            </p>
            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="bg-primary/40 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border-outline-variant/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-on-surface">
            Thống Kê Đặt Vé Theo Sự Kiện
          </CardTitle>
          <p className="text-xs text-on-surface-variant">
            Biểu đồ lượng vé đã bán trên tổng số vé phát hành của các sự kiện hàng đầu.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ecf9" />
                <XAxis dataKey="name" stroke="#777587" fontSize={12} tickLine={false} />
                <YAxis stroke="#777587" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #c7c4d8',
                    borderRadius: '8px',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Vé đã bán" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tổng số vé" fill="#bec6e0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
