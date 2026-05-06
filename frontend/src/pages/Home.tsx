import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-4xl font-bold text-center">
            🎫 Ticket Booking System
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Chào mừng đến với hệ thống đặt vé trực tuyến
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Sprint 1 hoàn thành! Hệ thống đã sẵn sàng với các tính năng:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">✅ Backend</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Eureka Server (Service Discovery)</li>
                  <li>• API Gateway (Port 8080)</li>
                  <li>• User Service (Authentication)</li>
                  <li>• Event Service</li>
                  <li>• Booking Service</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">✅ Frontend</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Vite + React + TypeScript</li>
                  <li>• Tailwind CSS + Shadcn UI</li>
                  <li>• React Hook Form + Zod</li>
                  <li>• React Router DOM</li>
                  <li>• Axios Client</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleLogout} variant="outline">
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
