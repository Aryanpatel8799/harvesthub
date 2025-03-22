import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag, 
  Leaf, 
  PlusCircle, 
  History, 
  Apple, 
  Banana,
  LineChart, 
  Goal, 
  TrendingUp, 
  BarChart4, 
  Calendar, 
  CheckCircle2, 
  Heart 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  _id: string;
  product: {
    name: string;
    price: number;
    unit: string;
    farmer: {
      fullName: string;
      phone: string;
    };
  };
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  rejectionReason?: string;
  createdAt: string;
}

const ConsumerDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nutritionProgress, setNutritionProgress] = useState({
    protein: 65,
    carbs: 80,
    fiber: 45,
    vitamins: 70
  });
  
  const [nutritionGoals, setNutritionGoals] = useState([
    { id: 1, title: "Eat 5 servings of vegetables", completed: true },
    { id: 2, title: "Drink 8 glasses of water", completed: false },
    { id: 3, title: "Consume 50g of protein", completed: true },
    { id: 4, title: "Limit sugar intake to 25g", completed: false },
  ]);

  const [recentMeals, setRecentMeals] = useState([
    { id: 1, name: "Spinach Salad", date: "Today", nutrients: ["Fiber", "Iron", "Vitamins"], tags: ["Green", "Low-carb"] },
    { id: 2, name: "Berry Smoothie", date: "Yesterday", nutrients: ["Antioxidants", "Vitamins"], tags: ["Breakfast"] },
    { id: 3, name: "Quinoa Bowl", date: "2 days ago", nutrients: ["Protein", "Fiber"], tags: ["Lunch"] },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/consumer`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleGoalCompletion = (id: number) => {
    setNutritionGoals(goals => goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.fullName?.split(" ")[0] || "User"}! 👋
        </h1>
        <p className="text-green-100">Your healthy food companion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center text-green-800">
              <LineChart className="mr-2 h-5 w-5 text-green-600" />
              Nutrition Tracker
            </CardTitle>
            <CardDescription>Monitor your daily nutrition</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 group transition-all"
              onClick={() => document.getElementById("nutrition-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span>Track Now</span>
              <TrendingUp className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center text-green-800">
              <Leaf className="mr-2 h-5 w-5 text-green-600" />
              Plant Disease Detection
            </CardTitle>
            <CardDescription>Check your home plants</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 group transition-all"
              onClick={() => navigate("/disease-detection")}
            >
              <span>Scan Plants</span>
              <PlusCircle className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center text-green-800">
              <ShoppingBag className="mr-2 h-5 w-5 text-green-600" />
              Marketplace
            </CardTitle>
            <CardDescription>Fresh produce from local farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 group transition-all"
              onClick={() => navigate("/marketplace")}
            >
              <span>Shop Now</span>
              <ShoppingBag className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12" id="nutrition-section">
        <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
          <BarChart4 className="mr-2 h-6 w-6 text-green-600" />
          Nutrition Tracker
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Daily Nutrition Progress</CardTitle>
              <CardDescription>Your nutritional intake for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-gray-500">{nutritionProgress.protein}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all" 
                    style={{ width: `${nutritionProgress.protein}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Carbohydrates</span>
                  <span className="text-sm text-gray-500">{nutritionProgress.carbs}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all" 
                    style={{ width: `${nutritionProgress.carbs}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fiber</span>
                  <span className="text-sm text-gray-500">{nutritionProgress.fiber}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all" 
                    style={{ width: `${nutritionProgress.fiber}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vitamins & Minerals</span>
                  <span className="text-sm text-gray-500">{nutritionProgress.vitamins}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all" 
                    style={{ width: `${nutritionProgress.vitamins}%` }} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                <PlusCircle className="mr-2 h-4 w-4" />
                Log Meal
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Daily Goals</CardTitle>
              <CardDescription>Track your nutrition goals</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[220px] pr-4">
                <div className="space-y-3">
                  {nutritionGoals.map((goal) => (
                    <div 
                      key={goal.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        goal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      } transition-colors`}
                    >
                      <div className="flex items-center">
                        <button 
                          onClick={() => toggleGoalCompletion(goal.id)}
                          className={`rounded-full p-1 mr-3 ${
                            goal.completed ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'
                          }`}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <span className={`text-sm font-medium ${goal.completed ? 'text-green-800' : 'text-gray-700'}`}>{goal.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Goal className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
          <History className="mr-2 h-6 w-6 text-green-600" />
          Recent Nutrition
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentMeals.map(meal => (
            <Card key={meal.id} className="shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{meal.name}</CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {meal.date}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-2">
                  {meal.nutrients.map((nutrient, i) => (
                    <Badge key={i} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                      {nutrient}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {meal.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
          <Calendar className="mr-2 h-6 w-6 text-green-600" />
          Seasonal Recommendations
        </h2>
        
        <Tabs defaultValue="fruits" className="w-full">
          <TabsList className="mb-4 w-full justify-start bg-green-50 p-1">
            <TabsTrigger value="fruits" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
              <Apple className="mr-2 h-4 w-4" />
              Fruits
            </TabsTrigger>
            <TabsTrigger value="vegetables" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
              <Leaf className="mr-2 h-4 w-4" />
              Vegetables
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fruits">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {["Apples", "Berries", "Oranges", "Pears"].map((fruit, index) => (
                <Card key={fruit} className="overflow-hidden group hover:shadow-md transition-all">
                  <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center overflow-hidden">
                    <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      {index === 0 ? "🍎" : index === 1 ? "🫐" : index === 2 ? "🍊" : "🍐"}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-800">{fruit}</h3>
                    <div className="flex items-center mt-1">
                      <Badge className="bg-green-100 text-green-700 border-none">In Season</Badge>
                      <Heart className="h-4 w-4 ml-auto text-red-400 cursor-pointer hover:text-red-500" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => navigate("/marketplace")}
                    >
                      Shop Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="vegetables">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {["Spinach", "Broccoli", "Carrots", "Kale"].map((vegetable, index) => (
                <Card key={vegetable} className="overflow-hidden group hover:shadow-md transition-all">
                  <div className="aspect-square bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center overflow-hidden">
                    <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      {index === 0 ? "🥬" : index === 1 ? "🥦" : index === 2 ? "🥕" : "🥗"}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-800">{vegetable}</h3>
                    <div className="flex items-center mt-1">
                      <Badge className="bg-green-100 text-green-700 border-none">In Season</Badge>
                      <Heart className="h-4 w-4 ml-auto text-red-400 cursor-pointer hover:text-red-500" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => navigate("/marketplace")}
                    >
                      Shop Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Track your recent purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      {order.product?.name || 'N/A'} ({order.quantity} {order.product?.unit || 'units'})
                    </TableCell>
                    <TableCell>{order.product?.farmer?.fullName || 'Unknown'}</TableCell>
                    <TableCell>₹{order.totalPrice?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View your order information
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Product Details</h4>
                  <p>Name: {selectedOrder.product?.name || 'N/A'}</p>
                  <p>Quantity: {selectedOrder.quantity} {selectedOrder.product?.unit || 'units'}</p>
                  <p>Price per unit: ₹{selectedOrder.product?.price?.toFixed(2) || '0.00'}</p>
                  <p>Total Price: ₹{selectedOrder.totalPrice?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Farmer Details</h4>
                  <p>Name: {selectedOrder.product?.farmer?.fullName || 'Unknown'}</p>
                  <p>Phone: {selectedOrder.product?.farmer?.phone || 'N/A'}</p>
                </div>
              </div>

              {selectedOrder.status === 'rejected' && selectedOrder.rejectionReason && (
                <div>
                  <h4 className="font-medium mb-2">Rejection Reason</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsumerDashboard; 